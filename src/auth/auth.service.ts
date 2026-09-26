import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type { UserType } from 'src/types';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './types/jwt-payload.interface';

/** Minimal user shape needed to mint a token. */
type TokenSubject = Pick<UserType, 'id' | 'username'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Creates a user and translates Mongo's duplicate-key error (E11000) into a
   * 400 so a taken username or email never surfaces as a 500.
   */
  async register(dto: RegisterDto) {
    try {
      return await this.userService.create(dto);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new BadRequestException(
          'An account with this username or email already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Verifies credentials and issues a token pair.
   *
   * An unknown username and a wrong password deliberately produce the same
   * 401 so the endpoint cannot be used to discover which accounts exist.
   */
  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    const isPasswordValid = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: this.generateAccessToken(safeUser),
      refreshToken: this.generateRefreshToken(safeUser),
    };
  }

  generateAccessToken(user: TokenSubject) {
    return this.sign(user, 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES_IN');
  }

  generateRefreshToken(user: TokenSubject) {
    return this.sign(user, 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN');
  }

  /** Signs a token for the given subject using the configured secret/expiry. */
  private sign(user: TokenSubject, secretKey: string, expiryKey: string) {
    const payload: JwtPayload = { sub: user.id, username: user.username };

    return this.jwt.sign(payload, {
      secret: this.config.get<string>(secretKey),
      expiresIn: this.config.get<string>(expiryKey),
    });
  }
}
