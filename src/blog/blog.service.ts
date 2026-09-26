import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { UserType } from 'src/types';
import { CreateBlogDto } from './dto/create-blog.dto';
import type { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogDocument } from './schemas/blog.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  /** Creates a post owned by the authenticated author. */
  async create(user: UserType, dto: CreateBlogDto) {
    return this.blogModel.create({ ...dto, author: user.id });
  }

  /**
   * Returns one page of posts together with the totals the client needs for
   * pagination controls. Passing `author` restricts the result to that user.
   */
  async findAll(page: number, limit: number, author?: UserType) {
    const filter = author ? { author: author.id } : {};

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .populate('author', '-password -__v')
        .populate('commentCount')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.blogModel.countDocuments(filter).exec(),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      blogs,
    };
  }

  async findById(id: string) {
    const blog = await this.blogModel
      .findById(id)
      .populate('author', '-password -__v')
      .populate('commentCount')
      .exec();

    if (!blog) {
      throw new NotFoundException('Post not found');
    }

    return blog;
  }

  /** Updates a post. Only its author may do so. */
  async update(user: UserType, blogId: string, dto: UpdateBlogDto) {
    const blog = await this.getOwnedPost(user, blogId, 'update');

    blog.set(dto);
    await blog.save();

    return blog;
  }

  /** Deletes a post. Only its author may do so. */
  async delete(user: UserType, blogId: string) {
    const blog = await this.getOwnedPost(user, blogId, 'delete');

    await blog.deleteOne();

    return blog;
  }

  /**
   * Loads a post and asserts the caller owns it.
   *
   * A post belonging to somebody else is reported as 403 so the caller knows
   * the difference between "does not exist" and "not yours".
   */
  private async getOwnedPost(user: UserType, blogId: string, action: string) {
    const blog = await this.blogModel.findById(blogId).exec();

    if (!blog) {
      throw new NotFoundException('Post not found');
    }

    if (blog.author.toString() !== user.id) {
      throw new ForbiddenException(
        `You are not allowed to ${action} this post`,
      );
    }

    return blog;
  }
}
