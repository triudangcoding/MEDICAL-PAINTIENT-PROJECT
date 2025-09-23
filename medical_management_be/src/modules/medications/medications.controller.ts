import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { MedicationsService } from '@/modules/medications/medications.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';

@Controller('admin/medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  async list(
    @UserInfo() user: IUserFromToken,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.medicationsService.list(active, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
  }

  @Post()
  async create(
    @Body() body: { name: string; strength?: string; form?: string; unit?: string; description?: string },
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.medicationsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; strength?: string; form?: string; unit?: string; description?: string; isActive?: boolean },
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.medicationsService.update(id, body);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.medicationsService.deactivate(id);
  }
}


