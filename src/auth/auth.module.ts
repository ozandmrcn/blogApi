import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthCookieService } from 'src/config/auth-cookie.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessGuard } from './guards/access-guard';
import { RefreshGuard } from './guards/refresh-guard';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    AccessStrategy,
    RefreshStrategy,
    // Exported so Blog and Comment controllers can guard their routes without
    // each re-registering the strategies.
    AccessGuard,
    RefreshGuard,
  ],
  exports: [AuthService, AuthCookieService, AccessGuard, RefreshGuard],
})
export class AuthModule {}
