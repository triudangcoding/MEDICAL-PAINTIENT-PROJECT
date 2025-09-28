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
  Query,
  UseGuards
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get(':id')
  async getPrescription(
    @Param('id') id: string,
    @UserInfo() user: IUserFromToken
  ) {
    const prescription = await this.prescriptionsService.getPrescriptionById(id);
    
    // Check permissions
    if (user.roles === UserRole.PATIENT && prescription.patientId !== user.id) {
      throw new HttpException('Bạn không có quyền xem đơn thuốc này', HttpStatus.FORBIDDEN);
    }
    
    if (user.roles === UserRole.DOCTOR && prescription.doctorId !== user.id) {
      throw new HttpException('Bạn không có quyền xem đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    return prescription;
  }

  @Get(':id/adherence-logs')
  async getAdherenceLogs(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    
    // Check permissions
    if (user.roles === UserRole.PATIENT && prescription.patientId !== user.id) {
      throw new HttpException('Bạn không có quyền xem nhật ký này', HttpStatus.FORBIDDEN);
    }
    
    if (user.roles === UserRole.DOCTOR && prescription.doctorId !== user.id) {
      throw new HttpException('Bạn không có quyền xem nhật ký này', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.getAdherenceLogs(prescriptionId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      patientId: user.roles === UserRole.PATIENT ? user.id : undefined
    });
  }

  @Get('patient/:patientId/schedule')
  async getMedicationSchedule(
    @Param('patientId') patientId: string,
    @UserInfo() user: IUserFromToken,
    @Query('date') date?: string
  ) {
    // Check permissions
    if (user.roles === UserRole.PATIENT && patientId !== user.id) {
      throw new HttpException('Bạn không có quyền xem lịch uống thuốc này', HttpStatus.FORBIDDEN);
    }
    
    if (user.roles === UserRole.DOCTOR) {
      // Doctor can view any patient's schedule
    } else if (user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền xem lịch uống thuốc', HttpStatus.FORBIDDEN);
    }

    const targetDate = date ? new Date(date) : undefined;
    return this.prescriptionsService.getMedicationSchedule(patientId, targetDate);
  }

  @Post(':id/log-adherence')
  async logAdherence(
    @Param('id') prescriptionId: string,
    @Body() body: {
      prescriptionItemId?: string;
      takenAt?: string;
      status: 'TAKEN' | 'MISSED' | 'SKIPPED';
      amount?: string;
      notes?: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể ghi nhật ký uống thuốc', HttpStatus.FORBIDDEN);
    }

    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    
    if (prescription.patientId !== user.id) {
      throw new HttpException('Bạn không có quyền ghi nhật ký cho đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.logAdherence({
      prescriptionId,
      prescriptionItemId: body.prescriptionItemId,
      patientId: user.id,
      takenAt: body.takenAt ? new Date(body.takenAt) : new Date(),
      status: body.status as any,
      amount: body.amount,
      notes: body.notes
    });
  }
}
