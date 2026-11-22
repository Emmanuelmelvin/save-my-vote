import { Global, Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppMetrics } from './app-metrics.js';

/** Sentry's Nest integration (named spans for guards, interceptors, handlers) plus app metrics. */
@Global()
@Module({
  imports: [SentryModule.forRoot()],
  providers: [AppMetrics],
  exports: [AppMetrics],
})
export class ObservabilityModule {}
