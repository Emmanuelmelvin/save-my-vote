import { LocalDisk, S3Disk, type StorageModuleOptions } from '@nestjs/storage';
import type { StorageSettings } from '../config/app-config.service.js';

/** The disk candidate photos and election logos are stored on. */
export const IMAGES_DISK = 'images';

/** Detected from the file's bytes, never the client's claim. No SVG: it can carry scripts. */
export const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/** The browser shrinks images first, so real uploads are far below this. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Every upload gets a new random key, so a stored image never changes. */
export const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

export function createImageStorageOptions(
  settings: StorageSettings,
): StorageModuleOptions {
  const disk =
    settings.driver === 'r2'
      ? new S3Disk({
          endpoint: settings.endpoint,
          region: 'auto',
          bucket: settings.bucket,
          credentials: {
            accessKeyId: settings.accessKeyId,
            secretAccessKey: settings.secretAccessKey,
          },
          publicUrl: settings.publicUrl,
        })
      : new LocalDisk({ root: settings.root, publicUrl: settings.publicUrl });
  return { default: IMAGES_DISK, disks: { [IMAGES_DISK]: disk } };
}
