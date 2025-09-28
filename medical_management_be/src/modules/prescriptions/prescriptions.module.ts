import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from '@/modules/prescriptions/prescriptions.service';
import { DoctorPrescriptionsController } from './doctor-prescriptions.controller';
import { PatientPrescriptionsController } from './patient-prescriptions.controller';
import { AdminPrescriptionsController } from './admin-prescriptions.controller';

@Module({
  imports: [DatabaseModule, LoggerModule],
  controllers: [
    PrescriptionsController,
    DoctorPrescriptionsController,
    PatientPrescriptionsController,
    AdminPrescriptionsController
  ],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService]
})
export class PrescriptionsModule {}
