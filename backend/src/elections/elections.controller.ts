import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import type { User } from '../users/user.entity.js';
import { BallotService } from './ballot.service.js';
import { ReplaceBallotDto } from './dto/ballot.dto.js';
import {
  CreateElectionDto,
  ExtendElectionDto,
  UpdateElectionDto,
} from './dto/election.dto.js';
import { ReplaceEmailTemplatesDto } from './dto/email-template.dto.js';
import { ElectionsService } from './elections.service.js';
import { EmailTemplatesService } from './email-templates.service.js';

/** Organiser endpoints. Every route is scoped to elections the signed-in user owns. */
@ApiTags('Elections')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('elections')
export class ElectionsController {
  constructor(
    private readonly elections: ElectionsService,
    private readonly ballot: BallotService,
    private readonly templates: EmailTemplatesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft election' })
  create(@CurrentUser() user: User, @Body() dto: CreateElectionDto) {
    return this.elections.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List your elections, newest first, with turnout analytics',
  })
  list(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.elections.listForOwner(user.id, query);
  }

  @Get(':electionId')
  @ApiOperation({
    summary: 'One election with its ballot, email templates and analytics',
  })
  get(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.elections.getDetail(user.id, electionId);
  }

  @Patch(':electionId')
  @ApiOperation({ summary: 'Edit basic info and branding (drafts only)' })
  update(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: UpdateElectionDto,
  ) {
    return this.elections.update(user.id, electionId, dto);
  }

  @Delete(':electionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft or finished election' })
  remove(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.elections.remove(user.id, electionId);
  }

  @Post(':electionId/extend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move a launched election’s end time later' })
  extend(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: ExtendElectionDto,
  ) {
    return this.elections.extendEnd(user.id, electionId, dto.endAt);
  }

  @Post(':electionId/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End voting now' })
  close(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.elections.close(user.id, electionId);
  }

  @Post(':electionId/launch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Validate and launch; the election can no longer be edited afterwards',
  })
  launch(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.elections.launch(user.id, electionId);
  }

  @Get(':electionId/ballot')
  getBallot(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.ballot.getOwnedBallot(user.id, electionId);
  }

  @Put(':electionId/ballot')
  @ApiOperation({
    summary:
      'Replace the whole ballot (positions and their candidates, in order)',
  })
  replaceBallot(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: ReplaceBallotDto,
  ) {
    return this.ballot.replaceBallot(user.id, electionId, dto);
  }

  @Get(':electionId/email-templates')
  @ApiOperation({
    summary:
      'Invitation, reminder and confirmation emails (defaults where not set)',
  })
  getTemplates(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.templates.listOwned(user.id, electionId);
  }

  @Put(':electionId/email-templates')
  @ApiOperation({
    summary:
      'Replace the custom email templates; omitted types fall back to defaults',
  })
  replaceTemplates(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
    @Body() dto: ReplaceEmailTemplatesDto,
  ) {
    return this.templates.replace(user.id, electionId, dto);
  }
}
