import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_COOKIE } from 'src/config/auth-cookie.service';
import type { UserType } from 'src/types';
import { UserService } from 'src/user/user.service';
import type { JwtPayload } from '../types/jwt-payload.interface';

/** Reads the raw token out of the request's httpOnly cookies. */
const readRefreshToken = (request: Request): string | null =>
  (request?.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ?? null;

/**
 * Guards the access-token rotation route. Kept as a separate strategy so a
 * refresh token can never be presented as an access token.
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([readRefreshToken]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') as string,
    });
  }

  /** Same contract as `AccessStrategy.validate`. */
  async validate(payload: JwtPayload): Promise<UserType> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    return user;
  }
}
