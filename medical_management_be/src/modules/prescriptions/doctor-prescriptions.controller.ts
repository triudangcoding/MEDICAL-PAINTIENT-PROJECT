import {
  Body,
  Controller,
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

@Controller('doctor/prescriptions')
export class DoctorPrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async createPrescription(
    @Body() body: {
      patientId: string;
      startDate?: string;
      endDate?: string;
      notes?: string;
      items: {
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
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể kê đơn thuốc', HttpStatus.FORBIDDEN);
    }

    console.log('=== DOCTOR CREATE PRESCRIPTION DEBUG ===');
    console.log('Doctor user:', user);
    console.log('Request body:', body);

    return this.prescriptionsService.createPrescription({
      patientId: body.patientId,
      doctorId: user.id,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      notes: body.notes,
      items: body.items
    });
  }

  @Get()
  async getDoctorPrescriptions(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('patientId') patientId?: string
  ) {
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể xem đơn thuốc', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.getPrescriptionsByDoctor(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      patientId
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
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể xem đơn thuốc của bệnh nhân', HttpStatus.FORBIDDEN);
    }

    return this.prescriptionsService.getPrescriptionsByDoctor(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      patientId
    });
  }

  @Get(':id')
  async getPrescriptionDetail(
    @Param('id') prescriptionId: string,
    @UserInfo() user: IUserFromToken
  ) {
    console.log('=== DOCTOR GET PRESCRIPTION DETAIL DEBUG ===');
    console.log('Doctor user:', user);
    console.log('Prescription ID:', prescriptionId);
    
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể xem chi tiết đơn thuốc', HttpStatus.FORBIDDEN);
    }

    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    
    // Verify prescription belongs to doctor
    if (prescription.doctorId !== user.id) {
      throw new HttpException('Bạn không có quyền xem đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    console.log('Prescription found:', { id: prescription.id, doctorId: prescription.doctorId, patientId: prescription.patientId });
    return prescription;
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
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể cập nhật đơn thuốc', HttpStatus.FORBIDDEN);
    }

    // Check if doctor owns this prescription
    const prescription = await this.prescriptionsService.getPrescriptionById(prescriptionId);
    if (prescription.doctorId !== user.id) {
      throw new HttpException('Bạn không có quyền cập nhật đơn thuốc này', HttpStatus.FORBIDDEN);
    }

    console.log('=== DOCTOR UPDATE PRESCRIPTION DEBUG ===');
    console.log('Doctor user:', user);
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

  @Get('patient/:patientId/adherence')
  async getPatientAdherence(
    @Param('patientId') patientId: string,
    @UserInfo() user: IUserFromToken,
    @Query('prescriptionId') prescriptionId?: string
  ) {
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể xem tình trạng tuân thủ của bệnh nhân', HttpStatus.FORBIDDEN);
    }

    if (prescriptionId) {
      return this.prescriptionsService.getAdherenceLogs(prescriptionId, {
        patientId
      });
    }

    // Get all prescriptions for this patient by this doctor
    const prescriptions = await this.prescriptionsService.getPrescriptionsByDoctor(user.id, {
      patientId
    });

    // Get adherence logs for all prescriptions
    const adherenceData = [];
    for (const prescription of prescriptions.items) {
      const logs = await this.prescriptionsService.getAdherenceLogs(prescription.id, {
        patientId
      });
      adherenceData.push({
        prescription,
        adherenceLogs: logs
      });
    }

    return adherenceData;
  }
}
