import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Rejects a request unless it carries a valid refresh token, i.e. the
 * httpOnly `refresh_token` cookie issued by `/auth/login`.
 */
@Injectable()
export class RefreshGuard extends AuthGuard('refresh') {}
