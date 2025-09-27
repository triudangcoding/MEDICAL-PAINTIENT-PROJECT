import { AuthService } from '@/core/auth/auth.service';
import { LocalAuthGuard } from '@/core/auth/guards/local-auth.guard';
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Public } from '@/common/decorators/isPublicRoute';
import { UserInfo } from '@/common/decorators/users.decorator';
import RegisterDto from '@/core/auth/dtos/register.dto';
import { IpTracking } from '@/common/decorators/ip';
import { UserAgent } from '@/common/decorators/userAgent';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @Public()
  async login(
    @UserInfo() user: any,
    @Res({ passthrough: true }) res: any,
    @UserAgent() userAgent: string,
    @IpTracking() ip: string
  ) {
    const data = await this.authService.login(user, userAgent, ip);
    res.setCookie('token', data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain:
        process.env.NODE_ENV === 'production' ? 'api.uniko.id.vn' : 'localhost',
      maxAge: 24 * 60 * 60 * 1000
    });

    return data;
  }

  @Post('/register')
  @Public()
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/logout')
  @Public()
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token', { path: '/' });
    return { success: true };
  }

  @Get('/me')
  async me(@UserInfo() user: any) {
    return user;
  }
}
