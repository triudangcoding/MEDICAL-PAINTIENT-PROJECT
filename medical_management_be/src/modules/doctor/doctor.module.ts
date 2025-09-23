import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [DoctorController],
  providers: [DoctorService]
})
export class DoctorModule {}


