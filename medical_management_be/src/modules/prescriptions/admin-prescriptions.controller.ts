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
import { PrescriptionsService } from './prescriptions.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole, PrescriptionStatus } from '@prisma/client';

@Controller('admin/prescriptions')
export class AdminPrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  private ensureAdmin(user: IUserFromToken) {
    console.log('🔍 CHECKING ADMIN PERMISSION - User:', user);
    console.log('🔍 User roles:', user?.roles);
    console.log('🔍 Is admin?', user?.roles === UserRole.ADMIN);
    if (user.roles !== UserRole.ADMIN) {
      console.log('❌ ADMIN PERMISSION DENIED');
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
    console.log('✅ ADMIN PERMISSION GRANTED');
  }

  @Get()
  async getAllPrescriptions(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET ALL PRESCRIPTIONS ENDPOINT HIT!');
    console.log('Query params:', { page, limit, status, doctorId, patientId });

    return this.prescriptionsService.getAllPrescriptions({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      doctorId,
      patientId
    });
  }

  @Get('stats')
  async getPrescriptionStats(@UserInfo() user: IUserFromToken) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET PRESCRIPTION STATS ENDPOINT HIT!');

    return this.prescriptionsService.getPrescriptionStats();
  }

  @Get(':id')
  async getPrescriptionById(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET PRESCRIPTION BY ID ENDPOINT HIT!');
    console.log('Prescription ID:', prescriptionId);

    return this.prescriptionsService.getPrescriptionById(prescriptionId);
  }

  @Patch(':id')
  async updatePrescription(
    @Param('id') prescriptionId: string,
    @Body() body: {
      status?: PrescriptionStatus;
      startDate?: string;
      endDate?: string;
      notes?: string;
      items?: {
        medicationId: string;
        dosage: string;
        frequencyPerDay: number;
        timesOfDay: string[];
        durationDays: number;
        route?: string;
        instructions?: string;
      }[];
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN UPDATE PRESCRIPTION ENDPOINT HIT!');
    console.log('Prescription ID:', prescriptionId);
    console.log('Update body:', body);

    return this.prescriptionsService.updatePrescription(prescriptionId, {
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      notes: body.notes,
      items: body.items
    });
  }

  @Get('doctor/:doctorId')
  async getDoctorPrescriptions(
    @Param('doctorId') doctorId: string,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PrescriptionStatus
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET DOCTOR PRESCRIPTIONS ENDPOINT HIT!');
    console.log('Doctor ID:', doctorId);

    return this.prescriptionsService.getPrescriptionsByDoctor(doctorId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status
    });
  }

  @Get('patient/:patientId')
  async getPatientPrescriptions(
    @Param('patientId') patientId: string,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PrescriptionStatus
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET PATIENT PRESCRIPTIONS ENDPOINT HIT!');
    console.log('Patient ID:', patientId);

    return this.prescriptionsService.getPrescriptionsByPatient(patientId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status
    });
  }

  @Get(':id/adherence-logs')
  async getPrescriptionAdherenceLogs(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET PRESCRIPTION ADHERENCE LOGS ENDPOINT HIT!');
    console.log('Prescription ID:', prescriptionId);

    return this.prescriptionsService.getAdherenceLogs(prescriptionId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  @Get('patient/:patientId/schedule')
  async getPatientSchedule(
    @Param('patientId') patientId: string,
    @UserInfo() user: IUserFromToken,
    @Query('date') date?: string
  ) {
    this.ensureAdmin(user);

    console.log('🚀 ADMIN GET PATIENT SCHEDULE ENDPOINT HIT!');
    console.log('Patient ID:', patientId);
    console.log('Date:', date);

    const targetDate = date ? new Date(date) : undefined;
    return this.prescriptionsService.getMedicationSchedule(patientId, targetDate);
  }
}
