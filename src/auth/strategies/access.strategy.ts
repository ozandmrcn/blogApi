import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE } from 'src/config/auth-cookie.service';
import type { UserType } from 'src/types';
import { UserService } from 'src/user/user.service';
import type { JwtPayload } from '../types/jwt-payload.interface';

/** Reads the raw token out of the request's httpOnly cookies. */
const readAccessToken = (request: Request): string | null =>
  (request?.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined) ?? null;

/**
 * Guards every protected route. The token is read from the httpOnly
 * `access_token` cookie rather than an Authorization header, which keeps it
 * out of reach of client-side JavaScript.
 */
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([readAccessToken]),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
    });
  }

  /**
   * Runs once the token signature and expiry have been verified. Resolving the
   * user here means a token belonging to a deleted account stops working
   * immediately, and gives guards a fully populated `request.user`.
   */
  async validate(payload: JwtPayload): Promise<UserType> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    return user;
  }
}
