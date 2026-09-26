import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Rejects a request unless it carries a valid access token, i.e. the
 * httpOnly `access_token` cookie issued by `/auth/login`.
 */
@Injectable()
export class AccessGuard extends AuthGuard('access') {}
