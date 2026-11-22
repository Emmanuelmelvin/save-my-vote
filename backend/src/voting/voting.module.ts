import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionsModule } from '../elections/elections.module.js';
import { Election } from '../elections/entities/election.entity.js';
import { VotersModule } from '../voters/voters.module.js';
import { ElectionResultsController } from './election-results.controller.js';
import { Vote } from './entities/vote.entity.js';
import { PublicElectionsController } from './public-elections.controller.js';
import { ResultsService } from './results.service.js';
import { VotingService } from './voting.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, Election]),
    ElectionsModule,
    VotersModule,
  ],
  controllers: [PublicElectionsController, ElectionResultsController],
  providers: [VotingService, ResultsService],
})
export class VotingModule {}
