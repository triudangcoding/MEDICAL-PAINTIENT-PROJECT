import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      usernameField: 'phoneNumber',
      passwordField: 'password'
    });
  }

  async validate(phoneNumber: string, password: string) {
    const user = await this.userService.validateUser({
      phoneNumber,
      password
    });
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName
    };
  }
}
