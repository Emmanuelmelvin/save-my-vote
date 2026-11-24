import { VersioningType, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AUTH_COOKIE_NAME } from './auth/auth-cookie.js';
import { AppConfig } from './config/app-config.service.js';
import { AppMetrics } from './observability/app-metrics.js';
import { HttpObservabilityMiddleware } from './observability/http-observability.middleware.js';

/** Default URI version: /api/v1/... */
export const API_VERSION = '1';

/**
 * HTTP-level setup shared by main.ts and the e2e tests, so tests exercise the
 * same prefix, cookies, CORS and body limits as production.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(AppConfig);

  app.setGlobalPrefix('api');
  // Routes live under /api/v1. A breaking change ships as v2 beside v1
  // (@Version('2') on the new handler) so deployed clients keep working.
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });
  if (config.trustProxy) app.set('trust proxy', 1);
  // First, so every request is timed, including ones rejected later.
  app.use(new HttpObservabilityMiddleware(app.get(AppMetrics)).handle);
  app.use(helmet());
  app.use(cookieParser());
  // Base64 logos and candidate photos can be large.
  app.useBodyParser('json', { limit: '10mb' });
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.enableShutdownHooks();

  if (config.swaggerEnabled) setUpSwagger(app);
}

function setUpSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('SaveMyVote API')
      .setDescription(
        'Organisers sign in and manage elections; voters use the public endpoints with their email and one-time code.\n\n' +
          'Every success response is `{ status: "success", data }`; every error is `{ status: "fail" | "error", statusCode, message, errors? }`.',
      )
      .setVersion(`${API_VERSION}.0`)
      .addCookieAuth(AUTH_COOKIE_NAME)
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs.json',
  });
}
