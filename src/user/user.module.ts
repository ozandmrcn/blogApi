import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  // The JWT strategies live in AuthModule only. Registering them here as well
  // created two competing instances of each strategy.
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
