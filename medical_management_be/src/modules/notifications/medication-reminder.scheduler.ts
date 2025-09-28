import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class MedicationReminderScheduler {
  private readonly logger = new Logger(MedicationReminderScheduler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // Chạy mỗi phút để kiểm tra nhắc nhở uống thuốc
  @Cron(CronExpression.EVERY_MINUTE)
  async handleMedicationReminders() {
    try {
      this.logger.log('Checking for medication reminders...');
      
      const remindersCreated = await this.notificationsService.scheduleMedicationReminders();
      
      if (remindersCreated > 0) {
        this.logger.log(`Created ${remindersCreated} medication reminders`);
      }
    } catch (error) {
      this.logger.error('Error scheduling medication reminders:', error);
    }
  }

  // Chạy hàng ngày lúc 9:00 sáng để tạo cảnh báo tuân thủ thấp
  @Cron('0 9 * * *')
  async handleLowAdherenceAlerts() {
    try {
      this.logger.log('Checking for low adherence patterns...');
      
      // Logic để kiểm tra tỷ lệ tuân thủ và tạo cảnh báo
      // Có thể implement sau khi có đủ dữ liệu adherence logs
      
    } catch (error) {
      this.logger.error('Error checking low adherence:', error);
    }
  }
}
