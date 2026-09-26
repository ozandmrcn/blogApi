import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { UserRecord, UserType } from 'src/types';
import type { CreateUserDto } from './dto/create.user.dto';
import type { UpdateUserDto } from './dto/update.user.dto';
import { User, UserDocument } from './schemas/user.schema';

/** Mongo's duplicate-key error code. */
const DUPLICATE_KEY = 11000;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Persists a new user. The password is hashed by the schema's `pre('save')`
   * hook, so the plain value never reaches the database.
   */
  async create(dto: CreateUserDto): Promise<UserType> {
    const user = await new this.userModel(dto).save();

    return this.toSafeUser(user);
  }

  async findAll(): Promise<UserType[]> {
    const users = await this.userModel.find().exec();

    return users.map((user) => this.toSafeUser(user));
  }

  /**
   * Looks a user up by id, returning `null` when there is no match. Callers
   * decide which error is appropriate, so an auth guard can answer 401
   * instead of leaking a 404 for a token pointing at a deleted account.
   */
  async findById(id: string): Promise<UserType | null> {
    const user = await this.userModel.findById(id).exec();

    return user ? this.toSafeUser(user) : null;
  }

  /**
   * Looks a user up by username including the stored password hash, which is
   * what the login flow compares the submitted password against.
   *
   * Returns `null` rather than throwing, so a wrong username and a wrong
   * password are indistinguishable to the caller.
   */
  async findByUsername(username: string): Promise<UserRecord | null> {
    const user = await this.userModel
      .findOne({ username })
      .select('+password')
      .exec();

    // `createdAt`/`updatedAt` are `Date` instances on the document but reach
    // the client as ISO strings, so the record is re-typed at that boundary.
    return user ? (user.toObject() as unknown as UserRecord) : null;
  }

  /**
   * Applies a partial update and returns the saved document.
   *
   * The document is loaded, mutated and saved rather than passed to
   * `findByIdAndUpdate`, because only `save()` fires the schema's `pre` hook —
   * an update that bypassed it would store the password in plain text.
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserType> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.password !== undefined) user.password = dto.password;

    try {
      await user.save();
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY) {
        throw new ConflictException('That username or email is already taken');
      }
      throw error;
    }

    return this.toSafeUser(user);
  }

  async delete(id: string): Promise<UserType> {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  /**
   * Normalises a hydrated document into the public user shape.
   *
   * `toObject()` is configured on the schema to drop `_id` and surface the
   * `id` virtual, and the password is deleted explicitly as a second line of
   * defence.
   */
  private toSafeUser(user: UserDocument): UserType {
    const plain = user.toObject() as Record<string, unknown>;

    delete plain.password;

    return plain as unknown as UserType;
  }
}
