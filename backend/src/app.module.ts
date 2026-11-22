import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor.js';
import { AppConfigModule } from './config/app-config.module.js';
import { AppConfig } from './config/app-config.service.js';
import { buildDataSourceOptions } from './database/database-options.js';
import { ElectionsModule } from './elections/elections.module.js';
import { HealthController } from './health/health.controller.js';
import { MailModule } from './mail/mail.module.js';
import { ObservabilityModule } from './observability/observability.module.js';
import { SchedulerModule } from './scheduler/scheduler.module.js';
import { VotersModule } from './voters/voters.module.js';
import { VotingModule } from './voting/voting.module.js';
import { NodeEnv, type EnvironmentVariables } from './config/environment.js';

@Module({
  imports: [
    // First, so Sentry's Nest integration wraps everything registered after it.
    ObservabilityModule,
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        buildDataSourceOptions({
          DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
          DB_HOST: config.get('DB_HOST', { infer: true }),
          DB_PORT: config.get('DB_PORT', { infer: true }),
          DB_USER: config.get('DB_USER', { infer: true }),
          DB_PASSWORD: config.get('DB_PASSWORD', { infer: true }),
          DB_NAME: config.get('DB_NAME', { infer: true }),
          DB_SSL: config.get('DB_SSL', { infer: true }),
          DB_RUN_MIGRATIONS: config.get('DB_RUN_MIGRATIONS', { infer: true }),
          DB_LOGGING: config.get('DB_LOGGING', { infer: true }),
        }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        throttlers: [
          { name: 'default', ttl: 60_000, limit: config.throttleLimit },
        ],
        // Test suites sign in many times from one address within a minute.
        skipIf: () => config.nodeEnv === NodeEnv.Test,
      }),
    }),
    CommonModule,
    MailModule,
    AuthModule,
    ElectionsModule,
    VotersModule,
    VotingModule,
    SchedulerModule,
  ],
  controllers: [HealthController],
  providers: [
    // Guards run in this order: rate limit first, then authentication.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: false,
      }),
    },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
