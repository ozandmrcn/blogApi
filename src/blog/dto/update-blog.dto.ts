import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';

/** Payload accepted by `PATCH /blog/:id`. */
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
