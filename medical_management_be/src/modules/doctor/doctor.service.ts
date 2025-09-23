import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { Utils } from '@/utils/utils';
import {
  AdherenceStatus,
  PrescriptionStatus,
  UserRole,
  Gender
} from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(private readonly databaseService: DatabaseService) { }

  private mapGender(input?: string | null): Gender | null {
    if (!input) return null;
    const normalized = input.toString().trim().toLowerCase();
    if (normalized === 'male') return Gender.MALE;
    if (normalized === 'female') return Gender.FEMALE;
    if (normalized === 'other') return Gender.OTHER;
    // Vietnamese aliases
    if (['nam', 'm', 'trai'].includes(normalized)) return Gender.MALE;
    if (['nu', 'nữ', 'f', 'gai', 'gái'].includes(normalized))
      return Gender.FEMALE;
    if (['khac', 'khác'].includes(normalized)) return Gender.OTHER;
    return null;
  }

  // Patients
  async listPatients(
    doctorId: string,
    q?: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where: any = {
      role: 'PATIENT',
      deletedAt: null,
      ...(q ? { fullName: { contains: q, mode: 'insensitive' } } : {})
    };
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        include: { profile: true },
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    return { items, total, page, limit };
  }


  async getPatient(id: string) {
    const user = await this.databaseService.client.user.findUnique({
      where: { id },
      include: { profile: true, medicalHistory: true }
    });
    if (!user || user.role !== UserRole.PATIENT) {
      throw new NotFoundException('Patient not found');
    }
    return user;
  }

  async createPatient(body: {
    fullName: string;
    phoneNumber: string;
    password: string;
    profile?: { gender?: string; birthDate?: string; address?: string };
  }) {
    // Basic validations to avoid 500 from invalid data shapes
    if (!body.fullName?.trim()) {
      throw new UnprocessableEntityException('Full name is required');
    }
    if (!body.phoneNumber?.trim()) {
      throw new UnprocessableEntityException('Phone number is required');
    }
    if (!body.password?.trim()) {
      throw new UnprocessableEntityException('Password is required');
    }
    if (body.profile?.birthDate) {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-MM-dd
      if (!isoDateRegex.test(body.profile.birthDate)) {
        throw new UnprocessableEntityException(
          'Invalid birthDate format (yyyy-MM-dd)'
        );
      }
    }
    const existing = await this.databaseService.client.user.findFirst({
      where: { phoneNumber: body.phoneNumber }
    });
    if (existing)
      throw new UnprocessableEntityException('Phone number already exists');
    const password = await Utils.HashUtils.hashPassword(body.password);
    const user = await this.databaseService.client.user.create({
      data: {
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        password,
        role: UserRole.PATIENT
      }
    });
    if (body.profile) {
      await this.databaseService.client.patientProfile.create({
        data: {
          userId: user.id,
          gender: this.mapGender(body.profile.gender),
          birthDate: body.profile.birthDate
            ? new Date(body.profile.birthDate)
            : null,
          address: body.profile.address ?? null
        }
      });
    }
    return this.getPatient(user.id);
  }

  async updatePatientProfile(
    id: string,
    body: { gender?: string; birthDate?: string; address?: string }
  ) {
    if (body.birthDate) {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(body.birthDate)) {
        throw new UnprocessableEntityException(
          'Invalid birthDate format (yyyy-MM-dd)'
        );
      }
    }
    const user = await this.getPatient(id);
    const exists = await this.databaseService.client.patientProfile.findUnique({
      where: { userId: id }
    });
    if (!exists) {
      await this.databaseService.client.patientProfile.create({
        data: {
          userId: id,
          gender: this.mapGender(body.gender),
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          address: body.address ?? null
        }
      });
    } else {
      await this.databaseService.client.patientProfile.update({
        where: { userId: id },
        data: {
          gender:
            body.gender !== undefined ? this.mapGender(body.gender) : undefined,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          address: body.address ?? undefined
        }
      });
    }
    return this.getPatient(id);
  }

  async updatePatientHistory(
    id: string,
    body: {
      conditions?: string[];
      allergies?: string[];
      surgeries?: string[];
      familyHistory?: string;
      lifestyle?: string;
      currentMedications?: string[];
      notes?: string;
    }
  ) {
    const user = await this.getPatient(id);
    const exists =
      await this.databaseService.client.patientMedicalHistory.findUnique({
        where: { patientId: id }
      });
    if (!exists) {
      await this.databaseService.client.patientMedicalHistory.create({
        data: {
          patientId: id,
          conditions: body.conditions ?? [],
          allergies: body.allergies ?? [],
          surgeries: body.surgeries ?? [],
          familyHistory: body.familyHistory,
          lifestyle: body.lifestyle,
          currentMedications: body.currentMedications ?? [],
          notes: body.notes
        }
      });
    } else {
      await this.databaseService.client.patientMedicalHistory.update({
        where: { patientId: id },
        data: {
          conditions: body.conditions,
          allergies: body.allergies,
          surgeries: body.surgeries,
          familyHistory: body.familyHistory,
          lifestyle: body.lifestyle,
          currentMedications: body.currentMedications,
          notes: body.notes
        }
      });
    }
    return this.getPatient(id);
  }

  // Prescriptions
  async createPrescription(
    doctorId: string,
    body: {
      patientId: string;
      items: Array<{
        medicationId: string;
        dosage: string;
        frequencyPerDay: number;
        timesOfDay: string[];
        durationDays: number;
        route?: string;
        instructions?: string;
      }>;
      notes?: string;
    }
  ) {
    const prescription = await this.databaseService.client.prescription.create({
      data: {
        patientId: body.patientId,
        doctorId,
        notes: body.notes,
        items: {
          createMany: {
            data: body.items.map((i) => ({
              medicationId: i.medicationId,
              dosage: i.dosage,
              frequencyPerDay: i.frequencyPerDay,
              timesOfDay: i.timesOfDay,
              durationDays: i.durationDays,
              route: i.route,
              instructions: i.instructions
            }))
          }
        }
      },
      include: { items: true }
    });
    return prescription;
  }

  async listPrescriptions(
    doctorId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.prescription.findMany({
        where: { doctorId },
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.prescription.count({ where: { doctorId } })
    ]);
    return { items, total, page, limit };
  }

  async getPrescription(id: string) {
    const p = await this.databaseService.client.prescription.findUnique({
      where: { id },
      include: { items: true, patient: true, doctor: true }
    });
    if (!p) throw new NotFoundException('Prescription not found');
    return p;
  }

  async updatePrescription(
    id: string,
    body: {
      items?: Array<{
        id?: string;
        medicationId: string;
        dosage: string;
        frequencyPerDay: number;
        timesOfDay: string[];
        durationDays: number;
        route?: string;
        instructions?: string;
      }>;
      notes?: string;
    }
  ) {
    const p = await this.getPrescription(id);
    // Update header
    await this.databaseService.client.prescription.update({
      where: { id },
      data: { notes: body.notes }
    });
    // Sync items: naive approach (delete and recreate if provided)
    if (body.items) {
      await this.databaseService.client.prescriptionItem.deleteMany({
        where: { prescriptionId: id }
      });
      await this.databaseService.client.prescriptionItem.createMany({
        data: body.items.map((i) => ({
          prescriptionId: id,
          medicationId: i.medicationId,
          dosage: i.dosage,
          frequencyPerDay: i.frequencyPerDay,
          timesOfDay: i.timesOfDay,
          durationDays: i.durationDays,
          route: i.route,
          instructions: i.instructions
        }))
      });
    }
    return this.getPrescription(id);
  }

  async cancelPrescription(id: string) {
    const p = await this.getPrescription(id);
    return this.databaseService.client.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.CANCELLED }
    });
  }

  // Adherence / Alerts
  async overview(doctorId: string) {
    const [
      patientsCount,
      activePrescriptions,
      unresolvedAlerts,
      takenLogs,
      totalItems
    ] = await Promise.all([
      this.databaseService.client.user.count({
        where: { role: UserRole.PATIENT, deletedAt: null }
      }),
      this.databaseService.client.prescription.count({ where: { doctorId } }),
      this.databaseService.client.alert.count({
        where: { doctorId, resolved: false }
      }),
      this.databaseService.client.adherenceLog.count({
        where: { status: AdherenceStatus.TAKEN }
      }),
      this.databaseService.client.prescriptionItem.count()
    ]);
    const adherenceRate = totalItems > 0 ? takenLogs / totalItems : 0;
    return {
      patientsCount,
      activePrescriptions,
      unresolvedAlerts,
      adherenceRate
    };
  }
  async getAdherenceStats(patientId: string) {
    const [totalItems, takenLogs] = await Promise.all([
      this.databaseService.client.prescriptionItem.count({
        where: { prescription: { patientId } }
      }),
      this.databaseService.client.adherenceLog.count({
        where: { patientId, status: AdherenceStatus.TAKEN }
      })
    ]);
    const rate = totalItems > 0 ? takenLogs / totalItems : 0;
    return { totalItems, takenLogs, adherenceRate: rate };
  }

  async listAlerts(doctorId: string) {
    return this.databaseService.client.alert.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async resolveAlert(id: string) {
    const alert = await this.databaseService.client.alert.findUnique({
      where: { id }
    });
    if (!alert) throw new NotFoundException('Alert not found');
    return this.databaseService.client.alert.update({
      where: { id },
      data: { resolved: true }
    });
  }
}
