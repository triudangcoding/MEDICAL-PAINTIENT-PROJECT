import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import RegisterDto from '@/core/auth/dtos/register.dto';
import { UpdateUserDto } from './dtos/update.dto';
import { UserRole } from '@prisma/client';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  private ensureAdmin(user: IUserFromToken) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
  }

  @Get()
  async list(
    @Query('role') role: UserRole | undefined,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    this.ensureAdmin(user);
    return this.usersService.adminListUsers({
      role,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
  }

  @Post()
  async create(@Body() body: RegisterDto, @UserInfo() user: IUserFromToken) {
    this.ensureAdmin(user);
    return this.usersService.adminCreateUser(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureAdmin(user);
    return this.usersService.adminUpdateUser(id, body);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    this.ensureAdmin(user);
    return this.usersService.adminSoftDeleteUser(id);
  }
}


