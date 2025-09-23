import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';

@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  async overview(@UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    return this.reportsService.overview();
  }
}


