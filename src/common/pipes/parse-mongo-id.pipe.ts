import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

/**
 * Rejects a malformed document id with a 400 before it reaches the model.
 *
 * Without this pipe Mongoose raises a `CastError` for a non-ObjectId string,
 * which Nest would surface as an unhelpful 500.
 */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('Invalid resource id');
    }

    return value;
  }
}
