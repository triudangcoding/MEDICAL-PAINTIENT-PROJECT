import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class MedicationsService {
  constructor(private readonly databaseService: DatabaseService) { }

  async list(
    isActive?: boolean,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where = isActive === undefined ? {} : { isActive };
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.medication.findMany({
        where,
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.medication.count({ where })
    ]);
    return { items, total, page, limit };
  }

  async create(data: {
    name: string;
    strength?: string;
    form?: string;
    unit?: string;
    description?: string;
  }) {
    return this.databaseService.client.medication.create({
      data
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      strength?: string;
      form?: string;
      unit?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const med = await this.databaseService.client.medication.findUnique({
      where: { id }
    });
    if (!med) throw new NotFoundException('Medication not found');
    return this.databaseService.client.medication.update({
      where: { id },
      data
    });
  }

  async deactivate(id: string) {
    const med = await this.databaseService.client.medication.findUnique({
      where: { id }
    });
    if (!med) throw new NotFoundException('Medication not found');
    return this.databaseService.client.medication.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
