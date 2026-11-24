import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  InjectDisk,
  StorageDisk,
  uploadToDisk,
  type StoredUpload,
} from '@nestjs/storage';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  IMAGE_CACHE_CONTROL,
  IMAGE_CONTENT_TYPES,
  IMAGES_DISK,
  MAX_IMAGE_BYTES,
} from './image-storage.js';

export interface UploadedImage {
  url: string;
}

@ApiTags('Uploads')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(@InjectDisk(IMAGES_DISK) private readonly images: StorageDisk) {}

  @Post('images')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Store a candidate photo or election logo and return its public URL',
    description:
      'JPEG, PNG, WebP or GIF (checked from the bytes), up to 5 MB. Unsupported types get 415, larger files 413.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadToDisk({
        disk: IMAGES_DISK,
        contentTypes: IMAGE_CONTENT_TYPES,
        cacheControl: IMAGE_CACHE_CONTROL,
        key: (file) => `images/${randomUUID()}${file.extension}`,
      }),
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    }),
  )
  uploadImage(@UploadedFile() file: StoredUpload | undefined): UploadedImage {
    if (!file) throw new BadRequestException('Attach the image as "file"');
    return { url: this.images.url(file.key) };
  }
}
