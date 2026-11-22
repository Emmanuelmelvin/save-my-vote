import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AppConfig } from '../config/app-config.service.js';
import { AppMetrics } from '../observability/app-metrics.js';
import { Page, type PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { Voter } from '../voters/entities/voter.entity.js';
import { BallotService, type BallotPosition } from './ballot.service.js';
import type {
  CreateElectionDto,
  UpdateElectionDto,
} from './dto/election.dto.js';
import { ElectionAccessService } from './election-access.service.js';
import {
  ElectionStats,
  ElectionStatsService,
} from './election-stats.service.js';
import {
  EmailTemplatesService,
  type EmailTemplateContent,
} from './email-templates.service.js';
import {
  DEFAULT_PRIMARY_COLOR,
  Election,
  ElectionPhase,
  ElectionStatus,
} from './entities/election.entity.js';

export interface ElectionSummary {
  id: string;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  status: ElectionStatus;
  phase: ElectionPhase;
  launchedAt: Date | null;
  branding: Election['branding'];
  createdAt: Date;
  updatedAt: Date;
  analytics: ReturnType<ElectionStats['toJSON']>;
}

export interface ElectionDetail extends ElectionSummary {
  ballot: BallotPosition[];
  emailTemplates: EmailTemplateContent[];
  votingLink: string;
}

/** Elections can't be scheduled to start less than this far ahead, so invitations have time to go out. */
const MIN_LAUNCH_LEAD_MS = 60 * 1000;

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private readonly elections: Repository<Election>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly access: ElectionAccessService,
    private readonly stats: ElectionStatsService,
    private readonly ballot: BallotService,
    private readonly templates: EmailTemplatesService,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  /** Where voters go to cast their ballot (a frontend route). */
  votingLink(electionId: string): string {
    return this.config.frontendUrl(`/vote/${electionId}`);
  }

  async create(
    ownerId: string,
    dto: CreateElectionDto,
  ): Promise<ElectionDetail> {
    ElectionsService.assertDateOrder(dto.startAt, dto.endAt);
    const election = await this.elections.save(
      this.elections.create({
        ownerId,
        title: dto.title,
        description: dto.description ?? '',
        startAt: dto.startAt,
        endAt: dto.endAt,
        logoUrl: dto.logoUrl ?? null,
        primaryColor: dto.primaryColor ?? DEFAULT_PRIMARY_COLOR,
        heroImageUrl: dto.heroImageUrl ?? null,
      }),
    );
    this.metrics.electionCreated();
    return this.toDetail(election);
  }

  async listForOwner(
    ownerId: string,
    query: PaginationQueryDto,
  ): Promise<Page<ElectionSummary>> {
    const [elections, total] = await this.elections.findAndCount({
      where: { ownerId },
      order: { createdAt: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });
    const stats = await this.stats.forElections(
      elections.map((election) => election.id),
    );
    return new Page(
      elections.map((election) =>
        ElectionsService.toSummary(election, stats.get(election.id)),
      ),
      total,
      query,
    );
  }

  async getDetail(
    ownerId: string,
    electionId: string,
  ): Promise<ElectionDetail> {
    return this.toDetail(await this.access.findOwned(ownerId, electionId));
  }

  async update(
    ownerId: string,
    electionId: string,
    dto: UpdateElectionDto,
  ): Promise<ElectionDetail> {
    const election = await this.dataSource.transaction(async (manager) => {
      const current = await this.access.lockEditable(
        manager,
        ownerId,
        electionId,
      );
      Object.assign(current, ElectionsService.definedOnly(dto));
      ElectionsService.assertDateOrder(current.startAt, current.endAt);
      return manager.save(current);
    });
    return this.toDetail(election);
  }

  async remove(ownerId: string, electionId: string): Promise<void> {
    const election = await this.access.findOwned(ownerId, electionId);
    if (!election.canBeDeleted()) {
      throw new ConflictException(
        'A launched election can only be deleted after it has ended',
      );
    }
    const result = await this.elections.delete({ id: electionId, ownerId });
    if (!result.affected) throw new NotFoundException('Election not found');
  }

  /** Moves a launched election's end later. The start can't change once launched. */
  async extendEnd(
    ownerId: string,
    electionId: string,
    endAt: Date,
  ): Promise<ElectionDetail> {
    const election = await this.dataSource.transaction(async (manager) => {
      const current = await this.access.lockOpen(manager, ownerId, electionId);
      if (current.isDraft) {
        throw new ConflictException(
          'Edit a draft election’s dates from its details instead',
        );
      }
      if (endAt <= current.endAt) {
        throw new BadRequestException(
          'The new end time must be later than the current one',
        );
      }
      current.endAt = endAt;
      return manager.save(current);
    });
    return this.toDetail(election);
  }

  /** Ends voting now (an upcoming election is closed before it opens). */
  async close(ownerId: string, electionId: string): Promise<ElectionDetail> {
    const election = await this.dataSource.transaction(async (manager) => {
      const current = await this.access.lockOpen(manager, ownerId, electionId);
      if (current.isDraft) {
        throw new ConflictException(
          'A draft election can simply be deleted instead',
        );
      }
      const now = new Date();
      current.endAt = now;
      if (current.startAt > now) current.startAt = now;
      return manager.save(current);
    });
    return this.toDetail(election);
  }

  /**
   * Locks the election for voting. Checks it's complete first and reports every
   * problem at once. After launch, the scheduler emails invitations (with one-time
   * codes) OTP_LEAD_MINUTES before the start.
   */
  async launch(ownerId: string, electionId: string): Promise<ElectionDetail> {
    const election = await this.dataSource.transaction(async (manager) => {
      const current = await this.access.lockEditable(
        manager,
        ownerId,
        electionId,
      );
      const problems: string[] = [];

      if (current.startAt.getTime() < Date.now() + MIN_LAUNCH_LEAD_MS) {
        problems.push(
          'The start time must be at least one minute in the future',
        );
      }
      if (current.endAt <= current.startAt)
        problems.push('The end time must be after the start time');

      const ballot = await this.ballot.getBallot(electionId);
      if (ballot.length === 0)
        problems.push('Add at least one position to the ballot');
      for (const position of ballot) {
        if (position.candidates.length === 0)
          problems.push(`"${position.title}" has no candidates`);
      }

      const voterCount = await manager.countBy(Voter, { electionId });
      if (voterCount === 0) problems.push('Add at least one voter');

      if (problems.length > 0) {
        throw new UnprocessableEntityException({
          message: 'This election is not ready to launch',
          errors: problems,
        });
      }

      current.status = ElectionStatus.Launched;
      current.launchedAt = new Date();
      this.metrics.electionLaunched({
        positions: ballot.length,
        voters: voterCount,
      });
      return manager.save(current);
    });
    return this.toDetail(election);
  }

  private async toDetail(election: Election): Promise<ElectionDetail> {
    const [stats, ballot, emailTemplates] = await Promise.all([
      this.stats.forElection(election.id),
      this.ballot.getBallot(election.id),
      this.templates.list(election.id),
    ]);
    return {
      ...ElectionsService.toSummary(election, stats),
      ballot,
      emailTemplates,
      votingLink: this.votingLink(election.id),
    };
  }

  static toSummary(
    election: Election,
    stats: ElectionStats = ElectionStats.empty(),
  ): ElectionSummary {
    return {
      id: election.id,
      title: election.title,
      description: election.description,
      startAt: election.startAt,
      endAt: election.endAt,
      status: election.status,
      phase: election.phaseAt(),
      launchedAt: election.launchedAt,
      branding: election.branding,
      createdAt: election.createdAt,
      updatedAt: election.updatedAt,
      analytics: stats.toJSON(),
    };
  }

  private static assertDateOrder(startAt: Date, endAt: Date): void {
    if (endAt <= startAt)
      throw new BadRequestException('endAt must be after startAt');
  }

  private static definedOnly<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(value).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
  }
}
