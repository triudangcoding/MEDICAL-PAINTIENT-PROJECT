import { UsersModule } from '@/modules/users/users.module';
import { MedicationsModule } from '@/modules/medications/medications.module';
import { ReportsModule } from '@/modules/reports/reports.module';
import { DoctorModule } from '@/modules/doctor/doctor.module';
import { PatientModule } from '@/modules/patient/patient.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PrescriptionsModule } from '@/modules/prescriptions/prescriptions.module';
import { Global, Module } from '@nestjs/common';
const modules = [
  UsersModule,
  MedicationsModule,
  ReportsModule,
  DoctorModule,
  PatientModule,
  NotificationsModule,
  PrescriptionsModule
];

@Global()
@Module({
  imports: [...modules],
  exports: [...modules]
})
export class FeatureModuleModule {}
