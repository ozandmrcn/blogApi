import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

/** Name of the cookie carrying the short-lived access token. */
export const ACCESS_TOKEN_COOKIE = 'access_token';

/** Name of the cookie carrying the long-lived refresh token. */
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Access token cookie lifetime: 24 hours. */
export const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;

/** Refresh token cookie lifetime: 7 days. */
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

type SameSite = 'lax' | 'strict' | 'none';

const isSameSite = (value: string): value is SameSite =>
  value === 'lax' || value === 'strict' || value === 'none';

/**
 * Centralises every attribute of the auth cookies.
 *
 * Both the "set" and the "clear" call must agree on `path`, `domain`,
 * `sameSite` and `secure`, otherwise the browser keeps the original cookie
 * and logout silently fails. Deriving both from this single service removes
 * that class of bug.
 */
@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  private baseOptions(): CookieOptions {
    const configuredSameSite =
      this.config.get<string>('COOKIE_SAME_SITE')?.toLowerCase() ?? 'lax';
    const sameSite: SameSite = isSameSite(configuredSameSite)
      ? configuredSameSite
      : 'lax';

    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    // Browsers reject SameSite=None unless the cookie is also marked Secure,
    // so that combination is forced here instead of failing at runtime.
    const secure =
      sameSite === 'none' ||
      this.config.get<string>('COOKIE_SECURE') === 'true' ||
      isProduction;

    return { httpOnly: true, secure, sameSite, path: '/' };
  }

  /** Options used when issuing a fresh access token. */
  accessTokenOptions(): CookieOptions {
    return { ...this.baseOptions(), maxAge: ACCESS_TOKEN_MAX_AGE };
  }

  /** Options used when issuing a fresh refresh token. */
  refreshTokenOptions(): CookieOptions {
    return { ...this.baseOptions(), maxAge: REFRESH_TOKEN_MAX_AGE };
  }

  /**
   * Options used when clearing cookies. `maxAge` is intentionally omitted:
   * Express translates this into an already-expired cookie.
   */
  clearOptions(): CookieOptions {
    return this.baseOptions();
  }
}
