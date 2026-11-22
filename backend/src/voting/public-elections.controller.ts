import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator.js';
import { CastVoteDto, VoterCredentialsDto } from './dto/voting.dto.js';
import { ResultsService } from './results.service.js';
import { VotingService } from './voting.service.js';

/** Voter-facing endpoints. No account needed: voters prove who they are with email + one-time code. */
@ApiTags('Voting (public)')
@Public()
@Controller('public/elections/:electionId')
export class PublicElectionsController {
  constructor(
    private readonly voting: VotingService,
    private readonly results: ResultsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Election info, branding and ballot for the voting page',
  })
  get(@Param('electionId', ParseUUIDPipe) electionId: string) {
    return this.voting.getPublicElection(electionId);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary:
      "Check a voter's email and one-time code before showing the ballot",
  })
  verify(
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: VoterCredentialsDto,
  ) {
    return this.voting.verifyVoter(electionId, dto);
  }

  @Post('vote')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Cast a ballot: one candidate for every position' })
  vote(
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: CastVoteDto,
  ) {
    return this.voting.castVote(electionId, dto);
  }

  @Get('results')
  @ApiOperation({ summary: 'Final results, available once voting has closed' })
  getResults(@Param('electionId', ParseUUIDPipe) electionId: string) {
    return this.results.forPublic(electionId);
  }
}
