import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionsModule } from '../elections/elections.module.js';
import { ElectionMailer } from './election-mailer.js';
import { Voter } from './entities/voter.entity.js';
import { OtpService } from './otp.service.js';
import { VoterInvitationService } from './voter-invitation.service.js';
import { VotersController } from './voters.controller.js';
import { VotersService } from './voters.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Voter]), ElectionsModule],
  controllers: [VotersController],
  providers: [
    VotersService,
    OtpService,
    ElectionMailer,
    VoterInvitationService,
  ],
  exports: [OtpService, ElectionMailer, VoterInvitationService],
})
export class VotersModule {}
