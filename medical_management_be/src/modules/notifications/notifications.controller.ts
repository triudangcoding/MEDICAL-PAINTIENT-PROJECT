import { Controller, Get, HttpException, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('doctor')
  async forDoctor(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.notificationsService.listForDoctor(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  @Get('patient')
  async forPatient(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.notificationsService.listForPatient(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  @Put(':id/resolve')
  async resolve(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    // Doctor or Patient can resolve their own alerts
    if (user.roles !== UserRole.DOCTOR && user.roles !== UserRole.PATIENT) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.notificationsService.resolve(id);
  }
}


