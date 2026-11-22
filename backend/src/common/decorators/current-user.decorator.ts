import {
  createParamDecorator,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../users/user.entity.js';

/** Injects the signed-in organiser, loaded fresh from the database by the JWT strategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;
    if (!user) throw new UnauthorizedException('You must be signed in');
    return user;
  },
);
