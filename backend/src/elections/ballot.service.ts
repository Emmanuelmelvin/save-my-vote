import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { ReplaceBallotDto } from './dto/ballot.dto.js';
import { Candidate } from './entities/candidate.entity.js';
import { Position } from './entities/position.entity.js';
import { ElectionAccessService } from './election-access.service.js';

export interface BallotCandidate {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
}

export interface BallotPosition {
  id: string;
  title: string;
  candidates: BallotCandidate[];
}

@Injectable()
export class BallotService {
  constructor(
    @InjectRepository(Position)
    private readonly positions: Repository<Position>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly access: ElectionAccessService,
  ) {}

  async getBallot(electionId: string): Promise<BallotPosition[]> {
    const positions = await this.positions.find({
      where: { electionId },
      relations: { candidates: true },
      order: { sortOrder: 'ASC', candidates: { sortOrder: 'ASC' } },
    });
    return positions.map(BallotService.toView);
  }

  async getOwnedBallot(
    ownerId: string,
    electionId: string,
  ): Promise<BallotPosition[]> {
    await this.access.findOwned(ownerId, electionId);
    return this.getBallot(electionId);
  }

  /**
   * Replaces the whole ballot atomically (matches the frontend's ballot step, which
   * edits positions and candidates together). Only allowed while the election is a draft.
   */
  async replaceBallot(
    ownerId: string,
    electionId: string,
    dto: ReplaceBallotDto,
  ): Promise<BallotPosition[]> {
    await this.dataSource.transaction(async (manager) => {
      await this.access.lockEditable(manager, ownerId, electionId);
      await manager.delete(Position, { electionId }); // candidates cascade

      for (const [positionIndex, input] of dto.positions.entries()) {
        const position = await manager.save(
          manager.create(Position, {
            electionId,
            title: input.title,
            sortOrder: positionIndex,
          }),
        );
        await manager.save(
          input.candidates.map((candidate, candidateIndex) =>
            manager.create(Candidate, {
              electionId,
              positionId: position.id,
              name: candidate.name,
              description: candidate.description || null,
              photoUrl: candidate.photoUrl || null,
              sortOrder: candidateIndex,
            }),
          ),
        );
      }
    });
    return this.getBallot(electionId);
  }

  private static toView(position: Position): BallotPosition {
    return {
      id: position.id,
      title: position.title,
      candidates: (position.candidates ?? []).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        description: candidate.description,
        photoUrl: candidate.photoUrl,
      })),
    };
  }
}
