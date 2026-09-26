import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // Exposes the .env file through ConfigService. Declared first so that
    // every module below can safely read its own configuration on init.
    ConfigModule.forRoot({ isGlobal: true }),

    // Opens the MongoDB connection. MongooseModule is async, so it resolves
    // MONGO_URI only after ConfigModule has finished loading the environment.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI') || 'mongodb://localhost/nest',
      }),
    }),

    AuthModule,
    UserModule,
    BlogModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
