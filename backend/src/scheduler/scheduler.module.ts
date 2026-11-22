import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from '../elections/entities/election.entity.js';
import { VotersModule } from '../voters/voters.module.js';
import { InvitationScheduler } from './invitation-scheduler.service.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Election]),
    VotersModule,
  ],
  providers: [InvitationScheduler],
  exports: [InvitationScheduler],
})
export class SchedulerModule {}
