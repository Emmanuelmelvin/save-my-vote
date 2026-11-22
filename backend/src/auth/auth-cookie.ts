import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppConfig } from '../config/app-config.service.js';

export const AUTH_COOKIE_NAME = 'access_token';

/** Reads and writes the httpOnly cookie that carries the access token for browser clients. */
@Injectable()
export class AuthCookie {
  constructor(private readonly config: AppConfig) {}

  set(response: Response, token: string): void {
    response.cookie(AUTH_COOKIE_NAME, token, {
      ...this.config.authCookieOptions,
      maxAge: this.config.jwt.accessTtlSeconds * 1000,
    });
  }

  clear(response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAME, this.config.authCookieOptions);
  }

  static read(request: Request): string | null {
    const value = (request.cookies as Record<string, unknown> | undefined)?.[
      AUTH_COOKIE_NAME
    ];
    return typeof value === 'string' && value ? value : null;
  }
}
