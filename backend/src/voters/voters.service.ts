import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { AppConfig } from '../config/app-config.service.js';
import { AppMetrics } from '../observability/app-metrics.js';
import {
  Page,
  type SearchPaginationQueryDto,
} from '../common/dto/pagination.dto.js';
import { chunk } from '../common/utils/concurrency.js';
import { ElectionAccessService } from '../elections/election-access.service.js';
import {
  CsvFormatError,
  CsvVoterParser,
  type RowError,
  type VoterInput,
} from './csv-voter-parser.js';
import { Voter, type VoterSummary } from './entities/voter.entity.js';

export interface UploadedCsv {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface AddVotersResult {
  added: number;
  /** Already on this election's roll (or repeated in the request). */
  skipped: number;
  totalVoters: number;
}

export interface ImportVotersResult extends AddVotersResult {
  failedRows: RowError[];
}

@Injectable()
export class VotersService {
  constructor(
    @InjectRepository(Voter) private readonly voters: Repository<Voter>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly access: ElectionAccessService,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  async list(
    ownerId: string,
    electionId: string,
    query: SearchPaginationQueryDto,
  ): Promise<Page<VoterSummary>> {
    await this.access.findOwned(ownerId, electionId);
    const builder = this.voters
      .createQueryBuilder('voter')
      .where('voter.electionId = :electionId', { electionId })
      .orderBy('voter.createdAt', 'ASC')
      .addOrderBy('voter.email', 'ASC')
      .take(query.limit)
      .skip(query.offset);

    if (query.search?.trim()) {
      const term = `%${query.search.trim().replace(/[\\%_]/g, '\\$&')}%`;
      builder.andWhere(
        new Brackets((where) =>
          where
            .where('voter.email ILIKE :term', { term })
            .orWhere('voter.fullName ILIKE :term', { term }),
        ),
      );
    }

    const [voters, total] = await builder.getManyAndCount();
    const maxAttempts = this.config.otp.maxAttempts;
    return new Page(
      voters.map((voter) => voter.toSummary(maxAttempts)),
      total,
      query,
    );
  }

  /**
   * Adds voters until the election ends; emails already on the roll are skipped.
   * Voters added after launch get their invitation from the next scheduler run
   * (or "send invitations now").
   */
  async add(
    ownerId: string,
    electionId: string,
    inputs: VoterInput[],
    source: 'api' | 'csv' = 'api',
  ): Promise<AddVotersResult> {
    const unique = new Map<string, VoterInput>();
    for (const input of inputs) {
      const email = input.email.trim().toLowerCase();
      if (!unique.has(email))
        unique.set(email, {
          email,
          fullName: input.fullName?.trim() || undefined,
        });
    }

    const result = await this.dataSource.transaction(async (manager) => {
      await this.access.lockOpen(manager, ownerId, electionId);
      let added = 0;
      for (const batch of chunk([...unique.values()], 1000)) {
        const result = await manager
          .createQueryBuilder()
          .insert()
          .into(Voter)
          .values(
            batch.map((voter) => ({
              electionId,
              email: voter.email,
              fullName: voter.fullName ?? null,
            })),
          )
          .orIgnore()
          .returning(['id'])
          .execute();
        added += (result.raw as unknown[]).length;
      }
      const totalVoters = await manager.countBy(Voter, { electionId });
      return { added, skipped: inputs.length - added, totalVoters };
    });
    this.metrics.votersAdded(result.added, source);
    return result;
  }

  async importCsv(
    ownerId: string,
    electionId: string,
    file: UploadedCsv | undefined,
  ): Promise<ImportVotersResult> {
    if (!file)
      throw new BadRequestException('Attach a CSV file in the "file" field');
    const looksLikeCsv =
      /\.csv$/i.test(file.originalname) ||
      /csv|text\/plain/.test(file.mimetype);
    if (!looksLikeCsv)
      throw new BadRequestException('The file must be a .csv file');

    // Ownership first, so a stranger can't use this endpoint to probe the parser.
    await this.access.findOwned(ownerId, electionId);

    let parsed;
    try {
      parsed = CsvVoterParser.parse(file.buffer.toString('utf8'));
    } catch (error) {
      if (error instanceof CsvFormatError)
        throw new BadRequestException(error.message);
      throw error;
    }
    if (parsed.voters.length === 0) {
      throw new BadRequestException({
        message: 'No valid voters found in the file',
        errors: parsed.errors.map((e) => `Row ${e.row}: ${e.reason}`),
      });
    }

    const result = await this.add(ownerId, electionId, parsed.voters, 'csv');
    return { ...result, failedRows: parsed.errors };
  }

  async remove(
    ownerId: string,
    electionId: string,
    voterId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.access.lockOpen(manager, ownerId, electionId);
      // A voter who has voted stays on the roll: removing them would make the
      // turnout figures disagree with the votes already counted.
      const result = await manager.delete(Voter, {
        id: voterId,
        electionId,
        hasVoted: false,
      });
      if (result.affected) return;
      const exists = await manager.existsBy(Voter, { id: voterId, electionId });
      if (exists) {
        throw new ConflictException(
          'This voter has already voted and cannot be removed',
        );
      }
      throw new NotFoundException('Voter not found');
    });
  }
}
