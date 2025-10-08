import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  Post,
  Body,
  UsePipes
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInfo } from '@/common/decorators/users.decorator';
import { IUserFromToken } from '@/modules/users/types/user.type';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { 
  sendReminderSchema, 
  quickConfirmSchema, 
  medicationScheduleQuerySchema,
  adherenceReportQuerySchema 
} from '@/schemas/medication-reminder.schema';

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

  // ==================== ENHANCED MEDICATION REMINDER ENDPOINTS ====================

  /**
   * Bác sĩ gửi nhắc nhở thủ công
   */
  @Post('doctor/send-reminder')
  async sendManualReminder(
    @Body(new ZodValidationPipe(sendReminderSchema)) data: any,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể gửi nhắc nhở', HttpStatus.FORBIDDEN);
    }

    try {
      return await this.notificationsService.sendManualReminder(user.id, data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Bệnh nhân xác nhận uống thuốc nhanh
   */
  @Post('patient/quick-confirm')
  async quickConfirmMedication(
    @Body() data: any,
    @UserInfo() user: IUserFromToken
  ) {
    console.log('=== QUICK CONFIRM DEBUG ===');
    console.log('User:', user.id, user.roles);
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Data.prescriptionItemId:', data?.prescriptionItemId);
    console.log('Data.prescriptionItemId type:', typeof data?.prescriptionItemId);
    console.log('=== END QUICK CONFIRM DEBUG ===');

    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xác nhận uống thuốc', HttpStatus.FORBIDDEN);
    }

    // Manual validation trước khi gọi service
    try {
      console.log('=== MANUAL VALIDATION ===');
      const validatedData = quickConfirmSchema.parse(data);
      console.log('Validation passed:', validatedData);
      console.log('=== END MANUAL VALIDATION ===');
      
      return await this.notificationsService.quickConfirmMedication(user.id, validatedData);
    } catch (error) {
      console.error('=== QUICK CONFIRM ERROR ===');
      console.error('Error:', error);
      
      // Check if it's a validation error
      if (error.errors) {
        console.error('Validation errors:', error.errors);
        throw new HttpException({
          message: 'Lỗi dữ liệu đầu vào',
          errors: error.errors
        }, HttpStatus.BAD_REQUEST);
      }
      
      // Service error
      console.error('Service error:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Lấy lịch uống thuốc cho bệnh nhân
   */
  @Get('patient/medication-schedule')
  async getMedicationSchedule(
    @Query(new ZodValidationPipe(medicationScheduleQuerySchema)) query: any,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem lịch uống thuốc', HttpStatus.FORBIDDEN);
    }

    return await this.notificationsService.getMedicationSchedule(user.id, query);
  }

  /**
   * Lấy thuốc sắp uống (trong 30 phút tới)
   */
  @Get('patient/upcoming-medications')
  async getUpcomingMedications(@UserInfo() user: IUserFromToken) {
    if (user.roles !== UserRole.PATIENT) {
      throw new HttpException('Chỉ bệnh nhân mới có thể xem thuốc sắp uống', HttpStatus.FORBIDDEN);
    }

    return await this.notificationsService.getUpcomingMedications(user.id);
  }

  /**
   * Bác sĩ xem báo cáo tuân thủ của bệnh nhân
   */
  @Get('doctor/adherence-report')
  async getAdherenceReport(
    @Query(new ZodValidationPipe(adherenceReportQuerySchema)) query: any,
    @UserInfo() user: IUserFromToken
  ) {
    if (user.roles !== UserRole.DOCTOR) {
      throw new HttpException('Chỉ bác sĩ mới có thể xem báo cáo tuân thủ', HttpStatus.FORBIDDEN);
    }

    // Kiểm tra bác sĩ có quyền xem bệnh nhân này không
    const prescription = await this.notificationsService['databaseService'].client.prescription.findFirst({
      where: {
        patientId: query.patientId,
        doctorId: user.id
      }
    });

    if (!prescription) {
      throw new HttpException('Bạn không có quyền xem báo cáo của bệnh nhân này', HttpStatus.FORBIDDEN);
    }

    return await this.notificationsService.getAdherenceReport(query);
  }
}
