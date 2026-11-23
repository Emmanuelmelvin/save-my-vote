import {
  Controller,
  Get,
  ServiceUnavailableException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('Health')
@Public()
@SkipThrottle()
// Unversioned (/api/health): probes and the Docker healthcheck shouldn't change with the API version.
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Liveness and database readiness' })
  async check(): Promise<{ api: 'up'; database: 'up' }> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { api: 'up', database: 'up' };
  }
}
