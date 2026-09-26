import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20_000)
  content: string;

  /** Optional cover image URL. */
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  photo?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  // `each` is what stops `tags: [1, 2, 3]` from passing as a string array.
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];
}
