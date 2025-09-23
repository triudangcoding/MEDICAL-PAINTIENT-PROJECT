import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';
import RegisterDto from '@/core/auth/dtos/register.dto';
import DeleteMultiplePatientsDto from './dtos/delete-multiple.dto';
import { UpdateUserDto } from './dtos/update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: RegisterDto, @UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException(
        'Bạn không có quyền tạo tài khoản',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.usersService.createUser(body);
  }

  @Get('me')
  async getMe(@UserInfo() user: IUserFromToken) {
    return await this.usersService.getMe(user);
  }

  @Delete('patient/multiple')
  async deleteMultiplePatients(
    @Body() body: DeleteMultiplePatientsDto,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException(
        'Bạn không có quyền xóa bệnh nhân',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.usersService.deleteMultiplePatients(body);
  }

  @Delete('patient/:id')
  async deletePatient(
    @Param('id') id: string,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền xóa bệnh nhân', HttpStatus.FORBIDDEN);
    }
    return await this.usersService.deletePatient(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException(
        'Bạn không có quyền cập nhật thông tin người dùng',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.usersService.update(id, body);
  }

  @Delete('multiple')
  async deleteMultiple(
    @Body() body: DeleteMultiplePatientsDto,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException(
        'Bạn không có quyền xóa người dùng',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.usersService.deleteMultiple(body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException(
        'Bạn không có quyền xóa người dùng',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.usersService.adminSoftDeleteUser(id);
  }

}
