import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AdherenceStatus, PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listActivePrescriptions(patientId: string) {
    return this.databaseService.client.prescription.findMany({
      where: { patientId, status: PrescriptionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPrescriptionDetail(patientId: string, id: string) {
    const p = await this.databaseService.client.prescription.findFirst({
      where: { id, patientId },
      include: { items: true, doctor: true }
    });
    if (!p) throw new NotFoundException('Prescription not found');
    return p;
  }

  async listHistory(patientId: string, params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const where: any = { patientId, status: { in: [PrescriptionStatus.COMPLETED, PrescriptionStatus.CANCELLED] } };
    const [items, total] = await Promise.all([
      this.databaseService.client.prescription.findMany({
        where,
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
        include: { doctor: true, items: true }
      }),
      this.databaseService.client.prescription.count({ where })
    ]);
    return { items, total, page, limit };
  }

  async getReminders(patientId: string) {
    const items = await this.databaseService.client.prescriptionItem.findMany({
      where: { prescription: { patientId, status: PrescriptionStatus.ACTIVE } },
      include: { prescription: true, medication: true }
    });
    // Expand to schedule entries
    const reminders: Array<{ date: string; time: string; prescriptionId: string; prescriptionItemId: string; medicationName: string; dosage: string }> = [];
    const today = new Date();
    for (const item of items) {
      const start = new Date(item.prescription.startDate);
      const end = item.prescription.endDate
        ? new Date(item.prescription.endDate)
        : new Date(start.getTime() + item.durationDays * 24 * 60 * 60 * 1000);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        for (const t of item.timesOfDay) {
          reminders.push({
            date: d.toISOString().slice(0, 10),
            time: t,
            prescriptionId: item.prescriptionId,
            prescriptionItemId: item.id,
            medicationName: item.medication.name,
            dosage: item.dosage
          });
        }
      }
    }
    return reminders;
  }

  async confirmIntake(
    patientId: string,
    prescriptionId: string,
    body: { prescriptionItemId: string; takenAt: string; status: AdherenceStatus; notes?: string }
  ) {
    const p = await this.databaseService.client.prescription.findFirst({ where: { id: prescriptionId, patientId } });
    if (!p) throw new NotFoundException('Prescription not found');
    return this.databaseService.client.adherenceLog.create({
      data: {
        prescriptionId,
        prescriptionItemId: body.prescriptionItemId,
        patientId,
        takenAt: new Date(body.takenAt),
        status: body.status,
        notes: body.notes
      }
    });
  }

  async adherenceHistory(patientId: string) {
    const logs = await this.databaseService.client.adherenceLog.findMany({
      where: { patientId },
      orderBy: { takenAt: 'desc' }
    });
    return logs;
  }

  async listAlerts(patientId: string) {
    return this.databaseService.client.alert.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
  }

  async overview(patientId: string) {
    const [activePrescriptions, takenLogs, totalItems, unresolvedAlerts] = await Promise.all([
      this.databaseService.client.prescription.count({ where: { patientId, status: 'ACTIVE' } }),
      this.databaseService.client.adherenceLog.count({ where: { patientId, status: AdherenceStatus.TAKEN } }),
      this.databaseService.client.prescriptionItem.count({ where: { prescription: { patientId } } }),
      this.databaseService.client.alert.count({ where: { patientId, resolved: false } })
    ]);
    const adherenceRate = totalItems > 0 ? takenLogs / totalItems : 0;
    return { activePrescriptions, adherenceRate, unresolvedAlerts };
  }
}


