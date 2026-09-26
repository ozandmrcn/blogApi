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
export class Comment {
  @Prop({ required: true, trim: true, maxlength: 1000 })
  content: string;

  @Prop({
    required: true,
    ref: 'Blog',
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  blog: string;

  @Prop({
    required: true,
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  user: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = Comment & Document;
