import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MedicationReminderScheduler } from './medication-reminder.scheduler';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, MedicationReminderScheduler],
  exports: [NotificationsService]
})
export class NotificationsModule {}
