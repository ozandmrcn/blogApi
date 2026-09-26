import { PartialType } from '@nestjs/mapped-types';
import { BaseUserDto } from './base-user.dto';

/**
 * Every field is optional, but the underlying constraints still apply to the
 * ones that are supplied.
 */
export class UpdateUserDto extends PartialType(BaseUserDto) {}
