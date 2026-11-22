import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { Response } from 'express';
import { isUniqueViolation } from '../database/database-errors.js';

export interface ErrorBody {
  status: 'fail' | 'error';
  statusCode: number;
  message: string;
  errors?: string[];
}

/**
 * Turns every thrown error into one JSON shape:
 * `{ status: 'fail' | 'error', statusCode, message, errors? }`.
 * 4xx are the caller's fault ("fail"); 5xx are ours ("error") and are logged, with
 * the details kept out of the response.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) return;

    const body = this.toBody(exception);
    if (body.statusCode >= 500) {
      // Our bugs go to Sentry as issues (with the request's trace); 4xx are expected.
      Sentry.captureException(exception);
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();
      let message = exception.message;
      let errors: string[] | undefined;

      if (typeof payload === 'object' && payload !== null) {
        const { message: raw, errors: rawErrors } = payload as {
          message?: unknown;
          errors?: unknown;
        };
        if (Array.isArray(raw)) {
          // ValidationPipe reports one message per invalid field.
          message = 'Validation failed';
          errors = raw.map(String);
        } else if (typeof raw === 'string') {
          message = raw;
        }
        if (Array.isArray(rawErrors)) errors = rawErrors.map(String);
      }

      return {
        status: statusCode < 500 ? 'fail' : 'error',
        statusCode,
        message,
        ...(errors ? { errors } : {}),
      };
    }

    if (isUniqueViolation(exception)) {
      return {
        status: 'fail',
        statusCode: HttpStatus.CONFLICT,
        message: 'That record already exists',
      };
    }

    return {
      status: 'error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
