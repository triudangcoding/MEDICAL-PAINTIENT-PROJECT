import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [PatientController],
  providers: [PatientService]
})
export class PatientModule {}


