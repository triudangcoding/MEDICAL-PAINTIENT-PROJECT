import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listForDoctor(
    doctorId: string,
    params?: { page?: number; limit?: number }
  ) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const [items, total] = await Promise.all([
      this.databaseService.client.alert.findMany({
        where: { doctorId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.alert.count({ where: { doctorId } })
    ]);
    return { items, total, page, limit };
  }

  async listForPatient(
    patientId: string,
    params?: { page?: number; limit?: number }
  ) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const [items, total] = await Promise.all([
      this.databaseService.client.alert.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.alert.count({ where: { patientId } })
    ]);
    return { items, total, page, limit };
  }

  async resolve(id: string) {
    return this.databaseService.client.alert.update({
      where: { id },
      data: { resolved: true }
    });
  }
}
