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
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

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

  // Hồ sơ bệnh nhân - chỉ lấy bệnh nhân có đơn thuốc ACTIVE
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

  // Tất cả bệnh nhân của doctor (bao gồm cả những người chưa có đơn thuốc)
  @Get('patients/all')
  async listAllPatients(
    @UserInfo() user: IUserFromToken,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    this.ensureDoctor(user);
    return this.doctorService.listAllPatients(user.id, q, {
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

  // Lấy danh sách bệnh nhân theo DoctorID cụ thể
  @Get('patients/doctor/:doctorId')
  async getPatientsByDoctorId(
    @Param('doctorId') doctorId: string,
    @UserInfo() user: IUserFromToken,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    this.ensureDoctor(user);
    
    // Admin có thể xem bệnh nhân của bất kỳ bác sĩ nào, Doctor chỉ xem được bệnh nhân của mình
    const effectiveDoctorId = user.roles === UserRole.ADMIN ? doctorId : user.id;
    
    return this.doctorService.getPatientsByDoctorId(effectiveDoctorId, q, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder
    });
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
  async overview(
    @UserInfo() user: IUserFromToken,
    @Query('doctorId') doctorId?: string
  ) {
    this.ensureDoctor(user);
    const effectiveDoctorId =
      user.roles === UserRole.ADMIN ? doctorId || user.id : user.id;
    return this.doctorService.overview(effectiveDoctorId);
  }

  // Chi tiết 1: Danh sách các thuốc đã kê (kèm PatientID, DoctorID, SL, hàm lượng)
  @Get('overview/prescription-items')
  async overviewPrescriptionItems(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('doctorId') doctorId?: string
  ) {
    this.ensureDoctor(user);
    const effectiveDoctorId =
      user.roles === UserRole.ADMIN ? doctorId || user.id : user.id;
    return this.doctorService.listPrescriptionItemsOverview(effectiveDoctorId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  // Chi tiết 2-3: Danh sách bệnh nhân đang điều trị kèm tỉ lệ tuân thủ
  @Get('overview/active-patients')
  async overviewActivePatients(
    @UserInfo() user: IUserFromToken,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('doctorId') doctorId?: string
  ) {
    this.ensureDoctor(user);
    const effectiveDoctorId =
      user.roles === UserRole.ADMIN ? doctorId || user.id : user.id;
    return this.doctorService.listActivePatientsWithAdherence(
      effectiveDoctorId,
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined
      }
    );
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

  // Adherence - Patients being monitored with missed doses
  @Get('adherence/missed')
  async patientsWithMissedDoses(
    @UserInfo() user: IUserFromToken,
    @Query('sinceDays') sinceDays?: string
  ) {
    this.ensureDoctor(user);
    return this.doctorService.listPatientsWithRecentMissedDoses(
      user.id,
      sinceDays ? parseInt(sinceDays) : 7
    );
  }

  // Adherence - Patients with detailed adherence status and alert types
  @Get('adherence/status')
  async patientsWithAdherenceAndAlerts(
    @UserInfo() user: IUserFromToken,
    @Query('sinceDays') sinceDays?: string
  ) {
    this.ensureDoctor(user);
    return this.doctorService.listPatientsWithAdherenceAndAlerts(
      user.id,
      sinceDays ? parseInt(sinceDays) : 7
    );
  }

  // Doctor sends adherence warning to a patient
  @Post('patients/:id/warn')
  async warnPatient(
    @Param('id') patientId: string,
    @Body() body: { message?: string },
    @UserInfo() user: IUserFromToken
  ) {
    this.ensureDoctor(user);
    return this.doctorService.warnPatientAdherence(
      user.id,
      patientId,
      body?.message
    );
  }

  // Test WebSocket notification (for debugging)
  @Post('test-websocket')
  async testWebSocket(@UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    return this.doctorService.testWebSocketNotification(user.id);
  }


  // CRUD Operations for Doctor Management
  
  // Route cụ thể phải đặt trước route có parameter động
  @Get('fields')
  @SkipTransform()
  async getAllDoctorFields(@UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    return this.doctorService.getDoctorAllFields(user.id);
  }

  @Put('fields')
  @SkipTransform()
  async updateDoctorFields(
    @UserInfo() user: IUserFromToken,
    @Body() body: {
      fullName?: string;
      phoneNumber?: string;
      password?: string;
      major?: string; // majorDoctorId
    }
  ) {
    this.ensureDoctor(user);
    return this.doctorService.updateDoctorFields(user.id, body);
  }

  @Post('doctor')
  async createDoctor(
    @Body()
    body: {
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
    @Body()
    body: {
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
  async getDoctor(@Param('id') id: string, @UserInfo() user: IUserFromToken) {
    this.ensureDoctor(user);
    const doctor = await this.doctorService.getDoctor(id);
    return { data: doctor };
  }
}
