import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voter } from '../voters/entities/voter.entity.js';
import { Vote } from '../voting/entities/vote.entity.js';
import { BallotService } from './ballot.service.js';
import { ElectionAccessService } from './election-access.service.js';
import { ElectionStatsService } from './election-stats.service.js';
import { ElectionsController } from './elections.controller.js';
import { ElectionsService } from './elections.service.js';
import { EmailTemplatesService } from './email-templates.service.js';
import { Candidate } from './entities/candidate.entity.js';
import { Election } from './entities/election.entity.js';
import { EmailTemplate } from './entities/email-template.entity.js';
import { Position } from './entities/position.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Election,
      Position,
      Candidate,
      EmailTemplate,
      Voter,
      Vote,
    ]),
  ],
  controllers: [ElectionsController],
  providers: [
    ElectionsService,
    ElectionAccessService,
    ElectionStatsService,
    BallotService,
    EmailTemplatesService,
  ],
  exports: [
    ElectionsService,
    ElectionAccessService,
    ElectionStatsService,
    BallotService,
    EmailTemplatesService,
  ],
})
export class ElectionsModule {}
