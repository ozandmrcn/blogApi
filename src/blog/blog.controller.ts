import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AccessGuard } from 'src/auth/guards/access-guard';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import type { UserType } from 'src/types';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogService } from './blog.service';

/** Request whose `user` has been populated by the access-token strategy. */
type AuthenticatedRequest = ExpressRequest & { user: UserType };

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AccessGuard)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateBlogDto) {
    return this.blogService.create(req.user, dto);
  }

  /** Public, paginated feed of every post. */
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.blogService.findAll(page, limit);
  }

  /** Paginated feed scoped to the authenticated author. */
  @UseGuards(AccessGuard)
  @Get('own')
  findOwn(
    @Request() req: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.blogService.findAll(page, limit, req.user);
  }

  @Get(':id')
  findById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.blogService.findById(id);
  }

  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.update(req.user, id, dto);
  }

  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    return this.blogService.delete(req.user, id);
  }
}
