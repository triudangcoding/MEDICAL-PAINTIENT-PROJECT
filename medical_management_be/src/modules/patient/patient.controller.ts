import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { AdherenceStatus, UserRole } from '@prisma/client';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  private ensurePatient(user: IUserFromToken) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
  }

  // Đơn thuốc & nhắc nhở
  @Get('prescriptions')
  async activePrescriptions(@UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.listActivePrescriptions(user.id);
  }

  @Get('prescriptions/:id')
  async prescriptionDetail(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.getPrescriptionDetail(user.id, id);
  }

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

  @Get('reminders')
  async reminders(@UserInfo() user: IUserFromToken) {
    this.ensurePatient(user);
    return this.patientService.getReminders(user.id);
  }

  // Xác nhận uống thuốc
  @Post('prescriptions/:id/confirm')
  async confirm(
    @Param('id') id: string,
    @Body()
    body: {
      prescriptionItemId: string;
      takenAt: string;
      status: AdherenceStatus;
      notes?: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensurePatient(user);
    return this.patientService.confirmIntake(user.id, id, body);
  }

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


