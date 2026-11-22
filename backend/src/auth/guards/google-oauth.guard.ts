import {
  Injectable,
  ServiceUnavailableException,
  type ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppConfig } from '../../config/app-config.service.js';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: AppConfig) {
    super({ session: false });
  }

  override canActivate(context: ExecutionContext) {
    if (!this.config.google.enabled) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }
    return super.canActivate(context);
  }
}
