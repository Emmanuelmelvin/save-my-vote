import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SearchPaginationQueryDto } from '../common/dto/pagination.dto.js';
import type { User } from '../users/user.entity.js';
import { AddVotersDto } from './dto/voter.dto.js';
import { VoterInvitationService } from './voter-invitation.service.js';
import { VotersService, type UploadedCsv } from './voters.service.js';

const MAX_CSV_BYTES = 5 * 1024 * 1024;

@ApiTags('Voters')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('elections/:electionId')
export class VotersController {
  constructor(
    private readonly voters: VotersService,
    private readonly invitations: VoterInvitationService,
  ) {}

  @Get('voters')
  @ApiOperation({
    summary: 'The voter roll, with invitation and voting status',
  })
  list(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Query() query: SearchPaginationQueryDto,
  ) {
    return this.voters.list(user.id, electionId, query);
  }

  @Post('voters')
  @ApiOperation({
    summary: 'Add voters (drafts only); existing emails are skipped',
  })
  add(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: AddVotersDto,
  ) {
    return this.voters.add(user.id, electionId, dto.voters);
  }

  @Post('voters/import')
  @ApiOperation({
    summary:
      'Import voters from a CSV with an "email" column and optional "name"/"fullName"',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CSV_BYTES, files: 1 } }),
  )
  importCsv(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @UploadedFile() file: UploadedCsv | undefined,
  ) {
    return this.voters.importCsv(user.id, electionId, file);
  }

  @Delete('voters/:voterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Param('voterId', ParseUUIDPipe) voterId: string,
  ) {
    return this.voters.remove(user.id, electionId, voterId);
  }

  @Post('voters/:voterId/resend-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Email one voter a new one-time code (also unlocks them)',
  })
  resendInvitation(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Param('voterId', ParseUUIDPipe) voterId: string,
  ) {
    return this.invitations.resendInvitation(user.id, electionId, voterId);
  }

  @Post('invitations/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Send invitations now to every voter not yet invited',
    description:
      'Otherwise the scheduler sends them automatically OTP_LEAD_MINUTES before the start.',
  })
  sendInvitations(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.invitations.sendInvitationsNow(user.id, electionId);
  }

  @Post('reminders/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60 * 60_000 } })
  @ApiOperation({
    summary:
      "Remind voters who haven't voted (while open); each gets a fresh code",
  })
  sendReminders(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.invitations.sendReminders(user.id, electionId);
  }
}
