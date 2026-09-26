import { BaseUserDto } from './base-user.dto';

/**
 * Payload accepted by the user service when creating an account. Shares its
 * rules with `RegisterDto` so both paths validate identically.
 */
export class CreateUserDto extends BaseUserDto {}
