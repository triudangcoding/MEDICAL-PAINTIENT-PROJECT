import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [MedicationsController],
  providers: [MedicationsService]
})
export class MedicationsModule {}
