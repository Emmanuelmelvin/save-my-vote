// Must be the first import: Sentry instruments http/express/pg as they load.
import './instrument.js';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { AppConfig } from './config/app-config.service.js';
import { validateEnvironment } from './config/environment.js';
import { AppLoggerFactory } from './observability/app-logger.js';

async function bootstrap(): Promise<void> {
  // Validate early so even start-up failures are logged through Winston.
  const logger = AppLoggerFactory.create(validateEnvironment(process.env));
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger,
  });
  configureApp(app);

  const config = app.get(AppConfig);
  await app.listen(config.port);
  Logger.log(
    `API listening on port ${config.port} (docs at /api/docs)`,
    'Bootstrap',
  );
}

await bootstrap();
