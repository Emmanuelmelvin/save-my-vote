import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { ResultsService } from './results.service.js';

@ApiTags('Elections')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('elections/:electionId/results')
export class ElectionResultsController {
  constructor(private readonly results: ResultsService) {}

  @Get()
  @ApiOperation({
    summary: 'Live results for your election (final once it ends)',
  })
  get(
    @CurrentUser() user: User,
    @Param('electionId', ParseUUIDPipe) electionId: string,
  ) {
    return this.results.forOwner(user.id, electionId);
  }
}
