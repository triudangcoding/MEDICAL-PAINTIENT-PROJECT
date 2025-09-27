import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AdherenceStatus, UserStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async overview() {
    const [
      totalPrescriptions,
      activePatients,
      totalTakenLogs,
      totalPrescriptionItems
    ] = await Promise.all([
      this.databaseService.client.prescription.count(),
      this.databaseService.client.user.count({
        where: { status: UserStatus.ACTIVE }
      }),
      this.databaseService.client.adherenceLog.count({
        where: { status: AdherenceStatus.TAKEN }
      }),
      this.databaseService.client.prescriptionItem.count()
    ]);

    const adherenceRate =
      totalPrescriptionItems > 0 ? totalTakenLogs / totalPrescriptionItems : 0;

    return {
      totalPrescriptions,
      activePatients,
      adherenceRate
    };
  }
}
