import { AuthController } from '@/core/auth/auth.controller';
import { AuthService } from '@/core/auth/auth.service';
import { JwtStrategy } from '@/core/auth/strategy/jwt.strategy';
import { LocalStrategy } from '@/core/auth/strategy/local.strategy';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService]
})
export class AuthModule {}
