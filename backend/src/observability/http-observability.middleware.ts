import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { AppMetrics } from './app-metrics.js';

/**
 * Times every HTTP request (including ones rejected by guards, throttling or
 * routing) and records it as a metric and an access-log line. Routes are reported
 * by their template (`/api/elections/:electionId`), never the raw URL, so ids
 * don't explode metric cardinality and tokens in query strings aren't logged.
 */
export class HttpObservabilityMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: AppMetrics) {}

  readonly handle = (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    const started = process.hrtime.bigint();
    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      const template = request.route?.path
        ? `${request.baseUrl}${String(request.route.path)}`
        : '';
      // Nest answers unknown URLs from a catch-all route ("/api*path").
      const route =
        !template || template.includes('*') ? 'unmatched' : template;
      const status = response.statusCode;

      this.metrics.httpRequest(
        { method: request.method, route, status },
        durationMs,
      );
      const line = `${request.method} ${route} ${status} ${durationMs.toFixed(1)}ms`;
      if (status >= 500) this.logger.error(line);
      else this.logger.log(line);
    });
    next();
  };
}
