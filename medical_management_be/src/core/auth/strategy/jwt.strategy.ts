import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import { IUserFromToken } from '@/modules/users/types/user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.accessTokenSecret', { infer: true }),
      ignoreExpiration: true
    });
  }

  async validate(payload: IUserFromToken) {
    const { id } = payload;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      id: user.id,
      roles: user.role
    };
  }
}
