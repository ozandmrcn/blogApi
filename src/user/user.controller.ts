import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from 'src/auth/guards/access-guard';
import type { UserType } from 'src/types';
import { UserService } from './user.service';
// A DTO used in a `@Body()` parameter must be imported as a *value*: Nest
// resolves the validation metatype from `emitDecoratorMetadata`, and a
// type-only import is erased at compile time, which silently turns the
// parameter into `Object` and makes every field fail the whitelist.
import { UpdateUserDto } from './dto/update.user.dto';

/** Request whose `user` has been populated by the access-token strategy. */
type AuthenticatedRequest = Request & { user: UserType };

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Returns the authenticated user's own profile, without the password. */
  @UseGuards(AccessGuard)
  @Get('me')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  /**
   * Updates the authenticated user's own profile. The service hashes a new
   * password before writing it, so a raw value is never stored.
   */
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('me')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, dto);
  }
}
