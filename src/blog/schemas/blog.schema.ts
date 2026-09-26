import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { type Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
    },
  },
  versionKey: false,
})
export class Blog {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
  title: string;

  @Prop({ required: true })
  content: string;

  /** Optional cover image URL. */
  @Prop()
  photo?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  author: string;

  /**
   * Not persisted — resolved on read from the `commentCount` virtual below.
   */
  commentCount?: number;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

/**
 * Denormalised comment total. Aggregating on every list request would mean one
 * extra query per post, so the count is joined in when a post is read.
 */
BlogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true,
});

export type BlogDocument = Blog & Document;
