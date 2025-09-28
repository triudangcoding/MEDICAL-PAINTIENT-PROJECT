import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { DoctorService } from '@/modules/doctor/doctor.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  private ensureDoctor(user: IUserFromToken) {
    if (user.roles !== UserRole.DOCTOR && user.roles !== UserRole.ADMIN) {
      throw new HttpException('Bạn không có quyền', HttpStatus.FORBIDDEN);
    }
  }

  @Get('doctor')
  async ListDoctor(
    @UserInfo() user: IUserFromToken,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    // Ensure user has permission to view doctors list
    this.ensureDoctor(user);
    return this.doctorService.ListDoctor(user.id, q, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
  }

  // Hồ sơ bệnh nhân
  @Get('patients')
  async listPatients(
    @UserInfo() user: IUserFromToken,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    this.ensureDoctor(user);
    return this.doctorService.listPatients(user.id, q, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
  }


  @Get('patients/:id')
  async getPatient(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    return this.doctorService.getPatient(id);
  }

  @Post('patients')
  async createPatient(
    @Body()
    body: {
      fullName: string;
      phoneNumber: string;
      password: string;
      profile?: { gender?: string; birthDate?: string; address?: string };
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    console.log('🚀 DOCTOR CREATE PATIENT ENDPOINT HIT!');
    console.log('Doctor user:', user);
    console.log('Request body:', body);
    return this.doctorService.createPatient(body, user.id);
  }

  @Put('patients/:id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: { gender?: string; birthDate?: string; address?: string },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.updatePatientProfile(id, body);
  }

  @Put('patients/:id/history')
  async updateHistory(
    @Param('id') id: string,
    @Body()
    body: {
      conditions?: string[];
      allergies?: string[];
      surgeries?: string[];
      familyHistory?: string;
      lifestyle?: string;
      currentMedications?: string[];
      notes?: string;
      extras?: Record<string, any>;
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.updatePatientHistory(id, body);
  }

  // Kê đơn thuốc - moved to DoctorPrescriptionsController

  // Prescriptions routes moved to DoctorPrescriptionsController

  // Theo dõi điều trị
  @Get('overview')
  async overview(@UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    return this.doctorService.overview(user.id);
  }

  @Get('patients/:id/adherence')
  async adherence(
    @Param('id') patientId: string,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.getAdherenceStats(patientId);
  }

  @Get('alerts')
  async listAlerts(@UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    return this.doctorService.listAlerts(user.id);
  }

  @Put('alerts/:id/resolve')
  async resolveAlert(
    @Param('id') id: string,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.resolveAlert(id);
  }

  // CRUD Operations for Doctor Management
  @Post('doctor')
  async createDoctor(
    @Body() body: {
      fullName: string;
      phoneNumber: string;
      password: string;
      majorDoctor: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    const doctor = await this.doctorService.createDoctor(body);
    return { data: doctor };
  }

  @Put('doctor/:id')
  async updateDoctor(
    @Param('id') id: string,
    @Body() body: {
      fullName?: string;
      phoneNumber?: string;
      majorDoctor?: string;
      status?: string;
    },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    const doctor = await this.doctorService.updateDoctor(id, body);
    return { data: doctor };
  }

  @Delete('doctor/:id')
  async deleteDoctor(
    @Param('id') id: string,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.deleteDoctor(id);
  }

  @Get('doctor/:id')
  async getDoctor(
    @Param('id') id: string,
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    const doctor = await this.doctorService.getDoctor(id);
    return { data: doctor };
  }
}
