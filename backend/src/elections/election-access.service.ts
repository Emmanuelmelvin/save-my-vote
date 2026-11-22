import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Election } from './entities/election.entity.js';

/**
 * The one place that answers "may this organiser touch this election?".
 * Ownership is part of the WHERE clause, so someone else's election is simply
 * "not found" (no hint that it exists).
 */
@Injectable()
export class ElectionAccessService {
  constructor(
    @InjectRepository(Election)
    private readonly elections: Repository<Election>,
  ) {}

  async findOwned(ownerId: string, electionId: string): Promise<Election> {
    const election = await this.elections.findOneBy({
      id: electionId,
      ownerId,
    });
    if (!election) throw new NotFoundException('Election not found');
    return election;
  }

  /**
   * Inside a transaction: lock the election row and make sure it's still a draft.
   * Holding the lock means a concurrent launch can't slip in mid-edit.
   */
  async lockEditable(
    manager: EntityManager,
    ownerId: string,
    electionId: string,
  ): Promise<Election> {
    const election = await this.lockOwned(manager, ownerId, electionId);
    ElectionAccessService.assertDraft(election);
    return election;
  }

  /**
   * Like lockEditable, but also allows launched elections that haven't ended:
   * the voter roll and the end date stay adjustable until voting closes.
   */
  async lockOpen(
    manager: EntityManager,
    ownerId: string,
    electionId: string,
  ): Promise<Election> {
    const election = await this.lockOwned(manager, ownerId, electionId);
    if (election.hasEnded()) {
      throw new ConflictException('This election has ended');
    }
    return election;
  }

  private async lockOwned(
    manager: EntityManager,
    ownerId: string,
    electionId: string,
  ): Promise<Election> {
    const election = await manager
      .getRepository(Election)
      .createQueryBuilder('election')
      .setLock('pessimistic_write')
      .where('election.id = :electionId AND election.ownerId = :ownerId', {
        electionId,
        ownerId,
      })
      .getOne();
    if (!election) throw new NotFoundException('Election not found');
    return election;
  }

  static assertDraft(election: Election): void {
    if (!election.isDraft) {
      throw new ConflictException(
        'This election has been launched and can no longer be edited',
      );
    }
  }
}
