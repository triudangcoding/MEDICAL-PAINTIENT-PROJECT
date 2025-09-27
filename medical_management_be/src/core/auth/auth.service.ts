import RegisterDto from '@/core/auth/dtos/register.dto';
import { DatabaseService } from '@/core/database/database.service';
import { LoggerService } from '@/core/logger/logger.service';
import { IJwtToken } from '@/core/types/token.i';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { Utils } from '@/utils/utils';
import { UserRole } from '@prisma/client';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  id: string;
  phoneNumber: string;
  roles: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly logger: LoggerService
  ) {}

  async login(user: IUserFromToken, userAgent: string, ip: string) {
    const userValid = await this.databaseService.client.user.findUnique({
      where: { id: user.id }
    });
    if (!userValid) throw new NotFoundException('User not found');
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      roles: userValid.role,
      id: user.id,
      name: userValid.fullName
    };
    const token = await this.generateAccessTokenAndRefreshToken(payload);

    // Lưu thông tin đăng nhập
    this.logger.verbose(
      `Người dùng ${user.phoneNumber} đăng nhập từ IP ${ip}, User-Agent: ${userAgent}`
    );

    return {
      ...token,
      user: userValid
    };
  }

  async register(body: RegisterDto) {
    const existingUser = await this.databaseService.client.user.findFirst({
      where: { phoneNumber: body.phoneNumber }
    });

    if (existingUser) {
      throw new HttpException(
        'Số điện thoại đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng số khác.',
        HttpStatus.CONFLICT
      );
    }

    const hashedPassword = await Utils.HashUtils.hashPassword(body.password);

    const newUser = await this.databaseService.client.user.create({
      data: {
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        fullName: body.fullName,
        role: UserRole.PATIENT
      }
    });

    const payload = {
      sub: newUser.id,
      phoneNumber: newUser.phoneNumber,
      roles: newUser.role,
      id: newUser.id,
      name: newUser.fullName
    };
    const token = await this.generateAccessTokenAndRefreshToken(payload);

    return {
      ...token,
      user: newUser
    };
  }

  // changePassword removed in simplified auth flow

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.accessTokenSecret'),
      expiresIn: this.configService.get('auth.accessTokenExpiresIn')
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('auth.refreshTokenSecret'),
      expiresIn: this.configService.get('auth.refreshTokenExpiresIn')
    });
  }

  async generateAccessTokenAndRefreshToken(
    payload: JwtPayload
  ): Promise<IJwtToken> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload)
    ]);
    return {
      accessToken,
      refreshToken
    };
  }

  // Simplified auth module: only login and register are exposed
}
