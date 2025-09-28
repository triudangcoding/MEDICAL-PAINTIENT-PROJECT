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
import { PrescriptionsService } from './prescriptions.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole, PrescriptionStatus } from '@prisma/client';
import { SkipPermission } from '@/common/decorators/isPublicRoute';

@Controller('patient/prescriptions')
export class PatientPrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  async getMyPrescriptions(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PrescriptionStatus
  ) {
    console.log('=== PATIENT GET PRESCRIPTIONS DEBUG ===');
    console.log('User:', user);
    console.log('User roles:', user.roles);
    console.log('User ID:', user.id);
    console.log('Query params:', { page, limit, status });
    
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem đơn thuốc của mình', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.getPrescriptionsByPatient(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status
    });
  }

  @Get(':id')
  async getPrescriptionDetail(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken
  ) {
    console.log('=== PATIENT GET PRESCRIPTION DETAIL DEBUG ===');
    console.log('User:', user);
    console.log('Prescription ID:', prescriptionId);
    
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem chi tiết đơn thuốc', HttpStatus.FORBIDDEN);
    }

    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    
    // Verify prescription belongs to patient
    if (prescription.patientId !== user.id) {
      throw new HttpException('Bạn không có quyền xem đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    console.log('Prescription found:', { id: prescription.id, patientId: prescription.patientId, doctorId: prescription.doctorId });
    return prescription;
  }

  @Get('schedule')
  async getMyMedicationSchedule(
    @UserInfo() user: IUserFromToken,
    @Query('date') date?: string
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem lịch uống thuốc', HttpStatus.FORBIDDEN);
    }

    const targetDate = date ? new Date(date) : undefined;
    return this.prescriptionsService.getMedicationSchedule(user.id, targetDate);
  }

  @Get('today')
  async getTodaySchedule(@UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem lịch hôm nay', HttpStatus.FORBIDDEN);
    }

    const today = new Date();
    return this.prescriptionsService.getMedicationSchedule(user.id, today);
  }

  @Post(':id/confirm-taken')
  async confirmMedicationTaken(
    @Param('id') prescriptionId: string,
    @Body() body: {
      prescriptionItemId?: string;
      amount?: string;
      notes?: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xác nhận uống thuốc', HttpStatus.FORBIDDEN);
    }

    console.log('=== PATIENT CONFIRM MEDICATION TAKEN DEBUG ===');
    console.log('Patient user:', user);
    console.log('Prescription ID:', prescriptionId);
    console.log('Body:', body);

    return this.prescriptionsService.logAdherence({
      prescriptionId,
      prescriptionItemId: body.prescriptionItemId,
      patientId: user.id,
      takenAt: new Date(),
      status: 'TAKEN',
      amount: body.amount,
      notes: body.notes
    });
  }

  @Post(':id/mark-missed')
  async markMedicationMissed(
    @Param('id') prescriptionId: string,
    @Body() body: {
      prescriptionItemId?: string;
      notes?: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể đánh dấu bỏ lỡ thuốc', HttpStatus.FORBIDDEN);
    }

    console.log('=== PATIENT MARK MEDICATION MISSED DEBUG ===');
    console.log('Patient user:', user);
    console.log('Prescription ID:', prescriptionId);
    console.log('Body:', body);

    return this.prescriptionsService.logAdherence({
      prescriptionId,
      prescriptionItemId: body.prescriptionItemId,
      patientId: user.id,
      takenAt: new Date(),
      status: 'MISSED',
      notes: body.notes
    });
  }

  @Get(':id/history')
  @SkipPermission()
  async getMedicationHistory(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem lịch sử uống thuốc', HttpStatus.FORBIDDEN);
    }

    // Verify prescription belongs to patient
    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    if (prescription.patientId !== user.id) {
      throw new HttpException('Bạn không có quyền xem lịch sử đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.getAdherenceLogs(prescriptionId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      patientId: user.id
    });
  }
}
