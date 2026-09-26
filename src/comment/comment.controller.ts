import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AccessGuard } from 'src/auth/guards/access-guard';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import type { UserType } from 'src/types';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

/** Request whose `user` has been populated by the access-token strategy. */
type AuthenticatedRequest = ExpressRequest & { user: UserType };

@Controller('blog/:blogId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /** Public: anyone can read a post's comment thread. */
  @Get()
  findAllByBlog(@Param('blogId', ParseMongoIdPipe) blogId: string) {
    return this.commentService.findAllByBlog(blogId);
  }

  @UseGuards(AccessGuard)
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('blogId', ParseMongoIdPipe) blogId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(req.user, blogId, dto);
  }

  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':commentId')
  delete(
    @Request() req: AuthenticatedRequest,
    @Param('blogId', ParseMongoIdPipe) blogId: string,
    @Param('commentId', ParseMongoIdPipe) commentId: string,
  ) {
    return this.commentService.delete(req.user, blogId, commentId);
  }
}
