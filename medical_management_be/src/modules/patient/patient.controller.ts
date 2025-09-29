import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { AdherenceStatus, UserRole } from '@prisma/client';
import { Public, SkipPermission } from '@/common/decorators/isPublicRoute';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  private ensurePatient(user: IUserFromToken) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
  }

  // Danh sách tất cả bệnh nhân (Admin/Doctor dùng để tra cứu)
  @Get('get-all')
  @Public()
  @SkipPermission()
  async listPatients() {
    return this.patientService.listAllPatients();
  }

  // Tìm kiếm bệnh nhân theo tên/số điện thoại
  @Get('search')
  @Public()
  @SkipPermission()
  async search(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.patientService.searchPatients({
      q,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  // Chi tiết bệnh nhân cho bác sĩ
  @Get(':id/detail')
  @Public()
  @SkipPermission()
  async getPatientDetail(@Param('id') id: string) {
    return this.patientService.getPatientDetailForDoctor(id);
  }

  // Cập nhật thông tin bệnh nhân
  @Post(':id')
  async updatePatient(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      phoneNumber?: string;
      password?: string;
      role?: string;
      status?: string;
      profile?: { 
        gender?: string; 
        birthDate?: string; 
        address?: string;
        birthYear?: number;
      };
    }
  ) {
    return this.patientService.updatePatient(id, body);
  }

  // Xóa bệnh nhân
  @Post(':id/delete')
  async deletePatient(@Param('id') id: string) {
    return this.patientService.deletePatient(id);
  }

  // Đơn thuốc & nhắc nhở - moved to PatientPrescriptionsController
  // Prescriptions routes moved to PatientPrescriptionsController
  // Lịch sử đơn thuốc
  @Get('history')
  async history(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    this.ensurePatient(user);
    return this.patientService.listHistory(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
  }
  // Lịch sử uống thuốc
  @Get('reminders')
  async reminders(@UserInfo() user: IUserFromToken, @Query('date') date?: string) {
    this.ensurePatient(user);
    return this.patientService.getReminders(user.id, date);
  }

  // Prescriptions confirmation moved to PatientPrescriptionsController

  @Get('adherence')
  async adherence(@UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.adherenceHistory(user.id);
  }

  @Get('overview')
  async overview(@UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.overview(user.id);
  }

  // Cảnh báo
  @Get('alerts')
  async alerts(@UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.listAlerts(user.id);
  }
}
