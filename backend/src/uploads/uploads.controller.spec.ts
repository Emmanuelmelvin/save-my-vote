import type { INestApplication } from '@nestjs/common';
import { InMemoryDisk, StorageModule } from '@nestjs/storage';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IMAGES_DISK, MAX_IMAGE_BYTES } from './image-storage.js';
import { UploadsController } from './uploads.controller.js';

const PUBLIC_URL = 'https://images.example.test/';
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64, 1),
]);

describe('UploadsController', () => {
  let app: INestApplication;
  let disk: InMemoryDisk;

  beforeEach(async () => {
    disk = new InMemoryDisk({ publicUrl: PUBLIC_URL });
    const moduleRef = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          isGlobal: false,
          default: IMAGES_DISK,
          disks: { [IMAGES_DISK]: disk },
        }),
      ],
      controllers: [UploadsController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  const upload = (body: Buffer, filename = 'photo.png') =>
    request(app.getHttpServer())
      .post('/uploads/images')
      .attach('file', body, { filename, contentType: 'image/png' });

  it('stores an image under a random key and returns its public URL', async () => {
    const response = await upload(PNG).expect(201);

    const [key] = disk.keys();
    expect(key).toMatch(/^images\/[0-9a-f-]{36}\.png$/);
    expect(response.body).toEqual({ url: `${PUBLIC_URL}${key}` });
    expect(await disk.getBuffer(key)).toEqual(PNG);
  });

  it('checks the bytes, not the declared type', async () => {
    await upload(Buffer.from('<svg onload="alert(1)"/>'), 'x.png').expect(415);
    expect(disk.keys()).toEqual([]);
  });

  it('refuses files over the size limit without storing them', async () => {
    const tooBig = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    await upload(tooBig).expect(413);
    expect(disk.keys()).toEqual([]);
  });

  it('asks for the file when none is attached', async () => {
    await request(app.getHttpServer()).post('/uploads/images').expect(400);
  });
});
