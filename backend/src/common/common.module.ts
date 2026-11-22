import { Global, Module } from '@nestjs/common';
import { AdvisoryLockService } from './database/advisory-lock.service.js';
import { PasswordHasher } from './security/password-hasher.js';

@Global()
@Module({
  providers: [
    AdvisoryLockService,
    { provide: PasswordHasher, useFactory: () => new PasswordHasher() },
  ],
  exports: [AdvisoryLockService, PasswordHasher],
})
export class CommonModule {}
