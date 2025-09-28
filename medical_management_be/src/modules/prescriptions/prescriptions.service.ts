import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { PrescriptionStatus, AdherenceStatus } from '@prisma/client';

export interface CreatePrescriptionDto {
  patientId: string;
  doctorId: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  items: CreatePrescriptionItemDto[];
}

export interface CreatePrescriptionItemDto {
  medicationId: string;
  dosage: string;
  frequencyPerDay: number;
  timesOfDay: string[];
  durationDays: number;
  route?: string;
  instructions?: string;
}

export interface UpdatePrescriptionDto {
  status?: PrescriptionStatus;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  items?: UpdatePrescriptionItemDto[];
}

export interface UpdatePrescriptionItemDto {
  id?: string;
  medicationId: string;
  dosage: string;
  frequencyPerDay: number;
  timesOfDay: string[];
  durationDays: number;
  route?: string;
  instructions?: string;
}

export interface AdherenceLogDto {
  prescriptionId: string;
  prescriptionItemId?: string;
  patientId: string;
  takenAt: Date;
  status: AdherenceStatus;
  amount?: string;
  notes?: string;
}

@Injectable()
export class PrescriptionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== PRESCRIPTION MANAGEMENT ====================

  async createPrescription(data: CreatePrescriptionDto) {
    console.log('=== CREATE PRESCRIPTION DEBUG ===');
    console.log('Input data:', data);

    // Validate patient exists
    const patient = await this.databaseService.client.user.findUnique({
      where: { id: data.patientId },
      select: { id: true, role: true }
    });

    if (!patient) {
      throw new NotFoundException('Bệnh nhân không tồn tại');
    }

    if (patient.role !== 'PATIENT') {
      throw new BadRequestException('Người dùng không phải là bệnh nhân');
    }

    // Validate doctor exists
    const doctor = await this.databaseService.client.user.findUnique({
      where: { id: data.doctorId },
      select: { id: true, role: true }
    });

    if (!doctor) {
      throw new NotFoundException('Bác sĩ không tồn tại');
    }

    if (doctor.role !== 'DOCTOR') {
      throw new BadRequestException('Người dùng không phải là bác sĩ');
    }

    // Validate medications exist
    const medicationIds = data.items.map(item => item.medicationId);
    const medications = await this.databaseService.client.medication.findMany({
      where: { 
        id: { in: medicationIds },
        isActive: true 
      },
      select: { id: true, name: true }
    });

    if (medications.length !== medicationIds.length) {
      throw new BadRequestException('Một số thuốc không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Create prescription with items
    const prescription = await this.databaseService.client.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        startDate: data.startDate || new Date(),
        endDate: data.endDate,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            medicationId: item.medicationId,
            dosage: item.dosage,
            frequencyPerDay: item.frequencyPerDay,
            timesOfDay: item.timesOfDay,
            durationDays: item.durationDays,
            route: item.route,
            instructions: item.instructions
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        items: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                strength: true,
                form: true,
                unit: true
              }
            }
          }
        }
      }
    });

    console.log('Created prescription:', prescription.id);
    console.log('=== END CREATE PRESCRIPTION DEBUG ===');

    return prescription;
  }

  async updatePrescription(prescriptionId: string, data: UpdatePrescriptionDto) {
    console.log('=== UPDATE PRESCRIPTION DEBUG ===');
    console.log('Prescription ID:', prescriptionId);
    console.log('Update data:', data);

    const existingPrescription = await this.databaseService.client.prescription.findUnique({
      where: { id: prescriptionId },
      include: { items: true }
    });

    if (!existingPrescription) {
      throw new NotFoundException('Đơn thuốc không tồn tại');
    }

    // If updating items, validate medications
    if (data.items) {
      const medicationIds = data.items.map(item => item.medicationId);
      const medications = await this.databaseService.client.medication.findMany({
        where: { 
          id: { in: medicationIds },
          isActive: true 
        },
        select: { id: true }
      });

      if (medications.length !== medicationIds.length) {
        throw new BadRequestException('Một số thuốc không tồn tại hoặc đã bị vô hiệu hóa');
      }
    }

    // Update prescription
    const updateData: any = {
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes
    };

    // Handle items update
    if (data.items) {
      // Delete existing items
      await this.databaseService.client.prescriptionItem.deleteMany({
        where: { prescriptionId }
      });

      // Create new items
      updateData.items = {
        create: data.items.map(item => ({
          medicationId: item.medicationId,
          dosage: item.dosage,
          frequencyPerDay: item.frequencyPerDay,
          timesOfDay: item.timesOfDay,
          durationDays: item.durationDays,
          route: item.route,
          instructions: item.instructions
        }))
      };
    }

    const updatedPrescription = await this.databaseService.client.prescription.update({
      where: { id: prescriptionId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        items: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                strength: true,
                form: true,
                unit: true
              }
            }
          }
        }
      }
    });

    console.log('Updated prescription:', updatedPrescription.id);
    console.log('=== END UPDATE PRESCRIPTION DEBUG ===');

    return updatedPrescription;
  }

  async getPrescriptionById(prescriptionId: string) {
    const prescription = await this.databaseService.client.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            profile: {
              select: {
                gender: true,
                birthDate: true,
                address: true
              }
            }
          }
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            majorDoctor: true
          }
        },
        items: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                strength: true,
                form: true,
                unit: true,
                description: true
              }
            }
          }
        },
        logs: {
          orderBy: { takenAt: 'desc' },
          take: 10
        }
      }
    });

    if (!prescription) {
      throw new NotFoundException('Đơn thuốc không tồn tại');
    }

    return prescription;
  }

  async getPrescriptionsByPatient(patientId: string, params?: {
    page?: number;
    limit?: number;
    status?: PrescriptionStatus;
  }) {
    console.log('=== GET PRESCRIPTIONS BY PATIENT DEBUG ===');
    console.log('Patient ID:', patientId);
    console.log('Params:', params);
    
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    
    const where: any = { patientId };
    if (params?.status) {
      where.status = params.status;
    }
    
    console.log('Where clause:', where);

    const [items, total] = await Promise.all([
      this.databaseService.client.prescription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              majorDoctor: true
            }
          },
          items: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  strength: true,
                  form: true
                }
              }
            }
          }
        }
      }),
      this.databaseService.client.prescription.count({ where })
    ]);

    console.log('Query results:');
    console.log('Items count:', items.length);
    console.log('Total count:', total);
    console.log('Items:', items.map(item => ({ id: item.id, patientId: item.patientId, status: item.status })));

    return { items, total, page, limit };
  }

  async getPrescriptionsByDoctor(doctorId: string, params?: {
    page?: number;
    limit?: number;
    status?: PrescriptionStatus;
    patientId?: string;
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    
    const where: any = { doctorId };
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    const [items, total] = await Promise.all([
      this.databaseService.client.prescription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              profile: {
                select: {
                  gender: true,
                  birthDate: true
                }
              }
            }
          },
          items: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  strength: true,
                  form: true
                }
              }
            }
          }
        }
      }),
      this.databaseService.client.prescription.count({ where })
    ]);

    return { items, total, page, limit };
  }

  async getAllPrescriptions(params?: {
    page?: number;
    limit?: number;
    status?: PrescriptionStatus;
    doctorId?: string;
    patientId?: string;
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.doctorId) {
      where.doctorId = params.doctorId;
    }
    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    const [items, total] = await Promise.all([
      this.databaseService.client.prescription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true
            }
          },
          doctor: {
            select: {
              id: true,
              fullName: true,
              majorDoctor: true
            }
          },
          items: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  strength: true,
                  form: true
                }
              }
            }
          }
        }
      }),
      this.databaseService.client.prescription.count({ where })
    ]);

    return { items, total, page, limit };
  }

  // ==================== ADHERENCE LOGGING ====================

  async logAdherence(data: AdherenceLogDto) {
    console.log('=== LOG ADHERENCE DEBUG ===');
    console.log('Adherence data:', data);

    // Validate prescription exists
    const prescription = await this.databaseService.client.prescription.findUnique({
      where: { id: data.prescriptionId },
      select: { id: true, patientId: true }
    });

    if (!prescription) {
      throw new NotFoundException('Đơn thuốc không tồn tại');
    }

    if (prescription.patientId !== data.patientId) {
      throw new BadRequestException('Bệnh nhân không có quyền ghi nhật ký cho đơn thuốc này');
    }

    // Validate prescription item if provided
    if (data.prescriptionItemId) {
      const item = await this.databaseService.client.prescriptionItem.findUnique({
        where: { id: data.prescriptionItemId },
        select: { id: true, prescriptionId: true }
      });

      if (!item || item.prescriptionId !== data.prescriptionId) {
        throw new BadRequestException('Dòng đơn thuốc không hợp lệ');
      }
    }

    const adherenceLog = await this.databaseService.client.adherenceLog.create({
      data: {
        prescriptionId: data.prescriptionId,
        prescriptionItemId: data.prescriptionItemId,
        patientId: data.patientId,
        takenAt: data.takenAt,
        status: data.status,
        amount: data.amount,
        notes: data.notes
      },
      include: {
        prescription: {
          select: {
            id: true,
            patient: {
              select: {
                fullName: true
              }
            }
          }
        },
        prescriptionItem: {
          include: {
            medication: {
              select: {
                name: true,
                strength: true
              }
            }
          }
        }
      }
    });

    console.log('Created adherence log:', adherenceLog.id);
    console.log('=== END LOG ADHERENCE DEBUG ===');

    return adherenceLog;
  }

  async getAdherenceLogs(prescriptionId: string, params?: {
    page?: number;
    limit?: number;
    patientId?: string;
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 50;
    
    const where: any = { prescriptionId };
    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    const [items, total] = await Promise.all([
      this.databaseService.client.adherenceLog.findMany({
        where,
        orderBy: { takenAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          prescriptionItem: {
            include: {
              medication: {
                select: {
                  name: true,
                  strength: true,
                  form: true
                }
              }
            }
          }
        }
      }),
      this.databaseService.client.adherenceLog.count({ where })
    ]);

    return { items, total, page, limit };
  }

  // ==================== STATISTICS ====================

  async getPrescriptionStats() {
    const [
      totalPrescriptions,
      activePrescriptions,
      completedPrescriptions,
      cancelledPrescriptions,
      totalPatients,
      adherenceRate
    ] = await Promise.all([
      this.databaseService.client.prescription.count(),
      this.databaseService.client.prescription.count({ where: { status: 'ACTIVE' } }),
      this.databaseService.client.prescription.count({ where: { status: 'COMPLETED' } }),
      this.databaseService.client.prescription.count({ where: { status: 'CANCELLED' } }),
      this.databaseService.client.user.count({ where: { role: 'PATIENT' } }),
      this.calculateAdherenceRate()
    ]);

    return {
      totalPrescriptions,
      activePrescriptions,
      completedPrescriptions,
      cancelledPrescriptions,
      totalPatients,
      adherenceRate
    };
  }

  private async calculateAdherenceRate() {
    const totalDoses = await this.databaseService.client.adherenceLog.count();
    const takenDoses = await this.databaseService.client.adherenceLog.count({
      where: { status: 'TAKEN' }
    });

    if (totalDoses === 0) return 0;
    return Math.round((takenDoses / totalDoses) * 100);
  }

  // ==================== MEDICATION REMINDERS ====================

  async getMedicationSchedule(patientId: string, date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activePrescriptions = await this.databaseService.client.prescription.findMany({
      where: {
        patientId,
        status: 'ACTIVE',
        startDate: { lte: endOfDay },
        OR: [
          { endDate: null },
          { endDate: { gte: startOfDay } }
        ]
      },
      include: {
        items: {
          include: {
            medication: {
              select: {
                name: true,
                strength: true,
                form: true
              }
            }
          }
        }
      }
    });

    // Generate schedule for the day
    const schedule = [];
    
    for (const prescription of activePrescriptions) {
      for (const item of prescription.items) {
        for (const timeOfDay of item.timesOfDay) {
          const [hours, minutes] = timeOfDay.split(':').map(Number);
          const scheduledTime = new Date(targetDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          schedule.push({
            prescriptionId: prescription.id,
            prescriptionItemId: item.id,
            medication: item.medication,
            dosage: item.dosage,
            scheduledTime,
            timeOfDay,
            route: item.route,
            instructions: item.instructions
          });
        }
      }
    }

    // Sort by time
    schedule.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    return schedule;
  }
}
