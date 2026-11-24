import { Module } from '@nestjs/common';
import { StorageModule } from '@nestjs/storage';
import { AppConfig } from '../config/app-config.service.js';
import { createImageStorageOptions } from './image-storage.js';
import { UploadsController } from './uploads.controller.js';

/** Image uploads: Cloudflare R2 in production, a local folder in development. */
@Module({
  imports: [
    StorageModule.forRootAsync({
      isGlobal: false,
      inject: [AppConfig],
      useFactory: (config: AppConfig) =>
        createImageStorageOptions(config.storage),
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
