import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import type { UserType } from 'src/types';
import {
  ACCESS_TOKEN_COOKIE,
  AuthCookieService,
  REFRESH_TOKEN_COOKIE,
} from 'src/config/auth-cookie.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessGuard } from './guards/access-guard';
import { RefreshGuard } from './guards/refresh-guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  /** Creates an account. No token is issued; the client logs in afterwards. */
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    // The service already returns the password-free user shape.
    return this.authService.register(dto);
  }

  /**
   * Exchanges credentials for a token pair, delivered as httpOnly cookies so
   * the access token is never reachable from JavaScript.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);

    res.cookie(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      this.cookies.accessTokenOptions(),
    );
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      this.cookies.refreshTokenOptions(),
    );

    return user;
  }

  /** Rotates the access token using the still-valid refresh token cookie. */
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshGuard)
  @Post('refresh-token')
  refresh(
    @Request() req: Request & { user: UserType },
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    res.cookie(
      ACCESS_TOKEN_COOKIE,
      this.authService.generateAccessToken(req.user),
      this.cookies.accessTokenOptions(),
    );

    return { message: 'A new access token has been issued' };
  }

  /** Clears both auth cookies using attributes identical to the ones set. */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessGuard)
  @Post('logout')
  logout(@Response({ passthrough: true }) res: ExpressResponse) {
    const clear = this.cookies.clearOptions();

    res.clearCookie(ACCESS_TOKEN_COOKIE, clear);
    res.clearCookie(REFRESH_TOKEN_COOKIE, clear);

    return { message: 'Signed out successfully' };
  }
}
