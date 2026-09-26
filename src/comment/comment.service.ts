import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { UserType } from 'src/types';
import { BlogService } from 'src/blog/blog.service';
import type { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly blogService: BlogService,
  ) {}

  /**
   * Adds a comment to a post. The post is resolved first so a comment can
   * never be attached to a non-existent post.
   */
  async create(user: UserType, blogId: string, dto: CreateCommentDto) {
    // Existence check only: throws 404 when the target post is gone.
    await this.blogService.findById(blogId);

    return this.commentModel.create({
      content: dto.content,
      blog: blogId,
      user: user.id,
    });
  }

  /** Newest-first comment thread for a post, with the author embedded. */
  async findAllByBlog(blogId: string) {
    return this.commentModel
      .find({ blog: blogId })
      .populate('user', '-password -__v')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Deletes a comment. The lookup matches the post, the comment and the
   * author at once, so a caller can only ever remove their own comment.
   */
  async delete(user: UserType, blogId: string, commentId: string) {
    const comment = await this.commentModel
      .findOneAndDelete({ _id: commentId, blog: blogId, user: user.id })
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
