import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import type { Document } from 'mongoose';

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
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  /** Always a bcrypt hash in the database, never a plain value. */
  @Prop({ required: true, select: false })
  password: string;

  /** Managed by Mongoose because the schema enables `timestamps: true`. */
  createdAt?: Date;

  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/** Hydrated document type handed to Mongoose queries. */
export type UserDocument = User & Document;

/**
 * Hashes the password on every save that modifies it, so callers can hand
 * over a plain value and rely on the schema to protect it.
 */
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error as Error);
  }
});
