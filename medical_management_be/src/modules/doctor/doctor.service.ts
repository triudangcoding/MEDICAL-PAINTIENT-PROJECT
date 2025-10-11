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
  Gender,
  MajorDoctor,
  UserStatus,
  AlertType
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

  async ListDoctor(
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
      role: 'DOCTOR',
      deletedAt: null,
      ...(q ? { fullName: { contains: q, mode: 'insensitive' } } : {})
    };
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        include: { 
          profile: true,
          majorDoctor: true 
        },
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    
    return { data: items, total, page, limit };
  }
  // Patients - chỉ lấy bệnh nhân đang điều trị
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
    // Lấy danh sách patient IDs có đơn thuốc ACTIVE của bác sĩ này
    const activePrescriptions = await this.databaseService.client.prescription.findMany({
      where: {
        doctorId: doctorId,
        status: 'ACTIVE',
      },
      select: {
        patientId: true
      }
    });

    // Lấy unique patient IDs
    const activePatientIds = [...new Set(activePrescriptions.map(p => p.patientId))];
    

    if (activePatientIds.length === 0) {
      return { 
        data: [], 
        total: 0, 
        page: params?.page || 1, 
        limit: params?.limit || 20 
      };
    }

    const where: any = {
      role: 'PATIENT',
      deletedAt: null,
      id: { in: activePatientIds }, // Chỉ lấy bệnh nhân có đơn thuốc ACTIVE
      ...(q ? { fullName: { contains: q, mode: 'insensitive' } } : {})
    };
    
    
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        include: { 
          profile: true,
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              majorDoctor: true,
              role: true
            }
          }
        },
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    return { data: items, total, page, limit };
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

  // Lấy danh sách bệnh nhân đang điều trị theo DoctorID cụ thể
  async getPatientsByDoctorId(
    doctorId: string,
    q?: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    // Kiểm tra bác sĩ có tồn tại không
    const doctor = await this.databaseService.client.user.findUnique({
      where: { id: doctorId, role: UserRole.DOCTOR, deletedAt: null }
    });
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Lấy danh sách patient IDs có đơn thuốc ACTIVE của bác sĩ này
    const activePrescriptions = await this.databaseService.client.prescription.findMany({
      where: {
        doctorId: doctorId,
        status: 'ACTIVE',
      },
      select: {
        patientId: true
      }
    });

    // Lấy unique patient IDs
    const activePatientIds = [...new Set(activePrescriptions.map(p => p.patientId))];

    if (activePatientIds.length === 0) {
      return { 
        data: [], 
        total: 0, 
        page: params?.page || 1, 
        limit: params?.limit || 20,
        doctor: {
          id: doctor.id,
          fullName: doctor.fullName,
          majorDoctorId: doctor.majorDoctorId
        }
      };
    }

    const where: any = {
      role: 'PATIENT',
      deletedAt: null,
      id: { in: activePatientIds }, // Chỉ lấy bệnh nhân có đơn thuốc ACTIVE
      ...(q ? { fullName: { contains: q, mode: 'insensitive' } } : {})
    };

    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        include: { 
          profile: true,
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              majorDoctor: true,
              role: true
            }
          }
        },
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);

    return { 
      data: items, 
      total, 
      page, 
      limit,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        majorDoctorId: doctor.majorDoctorId
      }
    };
  }

  async createPatient(
    body: {
      fullName: string;
      phoneNumber: string;
      password: string;
      profile?: { gender?: string; birthDate?: string; address?: string };
    },
    createdBy?: string
  ) {
    console.log('=== DOCTOR CREATE PATIENT DEBUG ===');
    console.log('Input body:', body);
    console.log('Created by:', createdBy);

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
    if (existing) {
      console.log('❌ Phone number already exists:', body.phoneNumber);
      throw new UnprocessableEntityException(
        'Số điện thoại này đã được sử dụng. Vui lòng chọn số khác.'
      );
    }
    const password = await Utils.HashUtils.hashPassword(body.password);

    const createData = {
      fullName: body.fullName,
      phoneNumber: body.phoneNumber,
      password,
      role: UserRole.PATIENT,
      createdBy: createdBy || null
    };

    console.log('Data to create user:', createData);

    const user = await this.databaseService.client.user.create({
      data: createData
    });

    console.log('Created user:', { id: user.id, createdBy: user.createdBy });

    if (body.profile) {
      console.log('Creating profile with data:', body.profile);
      console.log('Gender mapping:', {
        input: body.profile.gender,
        mapped: this.mapGender(body.profile.gender)
      });

      const profileData = {
        userId: user.id,
        gender: this.mapGender(body.profile.gender),
        birthDate: body.profile.birthDate
          ? new Date(body.profile.birthDate)
          : null,
        address: body.profile.address ?? null
      };

      console.log('Profile data to create:', profileData);

      await this.databaseService.client.patientProfile.create({
        data: profileData
      });
      console.log('Profile created successfully');
    } else {
      console.log('No profile data provided');
    }

    console.log('=== END DOCTOR CREATE PATIENT DEBUG ===');
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
      extras?: Record<string, any>;
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
          notes: body.notes,
          extras: body.extras
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
          notes: body.notes,
          extras: body.extras
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
    // Tổng số đơn thuốc của bác sĩ
    const totalPrescriptions =
      await this.databaseService.client.prescription.count({
        where: { doctorId }
      });

    // Bệnh nhân đang điều trị (distinct patientId trong các đơn ACTIVE của bác sĩ)
    const activePrescriptionPatients =
      await this.databaseService.client.prescription.findMany({
        where: { doctorId, status: PrescriptionStatus.ACTIVE },
        select: { patientId: true }
      });
    const activePatientsCount = new Set(
      activePrescriptionPatients.map((p) => p.patientId)
    ).size;

    // Tính adherence (taken / scheduled) trong phạm vi các đơn của bác sĩ
    const doctorPrescriptions =
      await this.databaseService.client.prescription.findMany({
        where: { doctorId },
        select: { id: true }
      });
    const prescriptionIds = doctorPrescriptions.map((p) => p.id);

    let adherenceRate = 0;
    if (prescriptionIds.length > 0) {
      const [items, takenLogs] = await Promise.all([
        this.databaseService.client.prescriptionItem.findMany({
          where: { prescriptionId: { in: prescriptionIds } },
          select: { frequencyPerDay: true, durationDays: true }
        }),
        this.databaseService.client.adherenceLog.count({
          where: {
            prescriptionId: { in: prescriptionIds },
            status: AdherenceStatus.TAKEN
          }
        })
      ]);
      const scheduledDoses = items.reduce(
        (sum, it) => sum + (it.frequencyPerDay || 0) * (it.durationDays || 0),
        0
      );
      adherenceRate = scheduledDoses > 0 ? takenLogs / scheduledDoses : 0;
    }

    return {
      totalPrescriptions,
      activePatientsCount,
      adherenceRate
    };
  }

  // Danh sách chi tiết các dòng đơn thuốc (thuốc đã kê) của bác sĩ
  async listPrescriptionItemsOverview(
    doctorId: string,
    params?: { page?: number; limit?: number }
  ) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;

    const [items, total] = await Promise.all([
      this.databaseService.client.prescriptionItem.findMany({
        where: { prescription: { doctorId } },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              strength: true,
              unit: true,
              form: true
            }
          },
          prescription: {
            select: {
              id: true,
              patient: {
                select: { id: true, fullName: true, phoneNumber: true }
              },
              doctor: { select: { id: true, fullName: true } }
            }
          }
        }
      }),
      this.databaseService.client.prescriptionItem.count({
        where: { prescription: { doctorId } }
      })
    ]);

    const rows = items.map((it) => ({
      prescriptionId: (it as any).prescription.id as string,
      patientId: (it as any).prescription.patient.id as string,
      patientName: (it as any).prescription.patient.fullName as string,
      doctorId: (it as any).prescription.doctor.id as string,
      doctorName: (it as any).prescription.doctor.fullName as string,
      medicationId: (it as any).medication?.id as string,
      medicationName: (it as any).medication?.name as string,
      strength: (it as any).medication?.strength as string | null,
      unit: (it as any).medication?.unit as string | null,
      form: (it as any).medication?.form as string | null,
      dosage: it.dosage,
      frequencyPerDay: it.frequencyPerDay,
      durationDays: it.durationDays,
      totalDoses: (it.frequencyPerDay || 0) * (it.durationDays || 0)
    }));

    return { items: rows, total, page, limit };
  }

  // Danh sách bệnh nhân đang điều trị kèm tỉ lệ tuân thủ (theo đơn của bác sĩ)
  async listActivePatientsWithAdherence(
    doctorId: string,
    params?: { page?: number; limit?: number }
  ) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;

    // Lấy tất cả đơn ACTIVE của bác sĩ và group theo bệnh nhân
    const prescriptions =
      await this.databaseService.client.prescription.findMany({
        where: { doctorId, status: PrescriptionStatus.ACTIVE },
        select: { id: true, patientId: true }
      });

    const patientIds = Array.from(
      new Set(prescriptions.map((p) => p.patientId))
    );
    const total = patientIds.length;

    const pagedPatientIds = patientIds.slice(
      (page - 1) * limit,
      (page - 1) * limit + limit
    );

    if (pagedPatientIds.length === 0) {
      return { items: [], total, page, limit };
    }

    // Map patient -> list prescriptionIds
    const mapPatientToPrescriptionIds: Record<string, string[]> = {};
    for (const p of prescriptions) {
      if (!mapPatientToPrescriptionIds[p.patientId]) {
        mapPatientToPrescriptionIds[p.patientId] = [];
      }
      mapPatientToPrescriptionIds[p.patientId].push(p.id);
    }

    // Fetch patient info
    const patients = await this.databaseService.client.user.findMany({
      where: { id: { in: pagedPatientIds } },
      select: { id: true, fullName: true, phoneNumber: true }
    });

    // For adherence calc: for each patient, get items for their prescriptions and taken logs
    const results = [] as Array<{
      patientId: string;
      patientName: string;
      phoneNumber: string | null;
      doctorId: string;
      doctorName: string | null;
      adherence: { taken: number; scheduled: number; rate: number };
      hasMedications: boolean;
    }>;

    // Fetch doctor info once
    const doctor = await this.databaseService.client.user.findUnique({
      where: { id: doctorId },
      select: { id: true, fullName: true }
    });

    // Preload items for all paged patients' prescriptions
    const pagedPrescriptionIds = pagedPatientIds.flatMap(
      (pid) => mapPatientToPrescriptionIds[pid] || []
    );

    const [items, takenLogsCounts] = await Promise.all([
      this.databaseService.client.prescriptionItem.findMany({
        where: { prescriptionId: { in: pagedPrescriptionIds } },
        select: {
          prescriptionId: true,
          frequencyPerDay: true,
          durationDays: true
        }
      }),
      // Count taken logs per patient across their prescriptions
      this.databaseService.client.adherenceLog.groupBy({
        by: ['patientId'],
        where: {
          patientId: { in: pagedPatientIds },
          prescriptionId: { in: pagedPrescriptionIds },
          status: AdherenceStatus.TAKEN
        },
        _count: { _all: true }
      })
    ]);

    const mapPatientTaken: Record<string, number> = {};
    for (const row of takenLogsCounts) {
      mapPatientTaken[(row as any).patientId as string] = (row as any)._count
        ._all as number;
    }

    // Compute scheduled per patient and check if they have medications
    const mapPatientScheduled: Record<string, number> = {};
    const mapPatientHasMedications: Record<string, boolean> = {};
    
    for (const pid of pagedPatientIds) {
      const ids = mapPatientToPrescriptionIds[pid] || [];
      const patientItems = items.filter((i) => ids.includes(i.prescriptionId));
      const scheduled = patientItems.reduce(
        (sum, it) => sum + (it.frequencyPerDay || 0) * (it.durationDays || 0),
        0
      );
      mapPatientScheduled[pid] = scheduled;
      mapPatientHasMedications[pid] = patientItems.length > 0;
    }

    for (const p of patients) {
      const taken = mapPatientTaken[p.id] || 0;
      const scheduled = mapPatientScheduled[p.id] || 0;
      const rate = scheduled > 0 ? taken / scheduled : 0;
      results.push({
        patientId: p.id,
        patientName: p.fullName,
        phoneNumber: p.phoneNumber,
        doctorId: doctor?.id || doctorId,
        doctorName: doctor?.fullName || null,
        adherence: { taken, scheduled, rate },
        hasMedications: mapPatientHasMedications[p.id] || false
      });
    }

    return { items: results, total, page, limit };
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

  // ==================== Adherence - Missed dose monitoring and doctor warnings ====================
  async listPatientsWithRecentMissedDoses(
    doctorId: string,
    sinceDays: number = 7
  ) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    // Find all prescriptions of this doctor and collect related patientIds
    const prescriptions =
      await this.databaseService.client.prescription.findMany({
        where: { doctorId },
        select: { id: true, patientId: true }
      });

    if (prescriptions.length === 0) {
      return { items: [], total: 0, since: sinceDate.toISOString() };
    }

    const patientIds = Array.from(
      new Set(prescriptions.map((p) => p.patientId))
    );

    // Group MISSED adherence logs by patient within timeframe for prescriptions of this doctor
    const missedByPatient =
      await this.databaseService.client.adherenceLog.groupBy({
        by: ['patientId'],
        where: {
          patientId: { in: patientIds },
          status: AdherenceStatus.MISSED,
          takenAt: { gte: sinceDate },
          prescriptionId: { in: prescriptions.map((p) => p.id) }
        },
        _count: { _all: true }
      });

    if (missedByPatient.length === 0) {
      return { items: [], total: 0, since: sinceDate.toISOString() };
    }

    const mapCounts: Record<string, number> = {};
    for (const row of missedByPatient) {
      mapCounts[row.patientId] = (row as any)._count._all as number;
    }

    // Fetch patient basic info for those who have missed logs
    const patients = await this.databaseService.client.user.findMany({
      where: { id: { in: Object.keys(mapCounts) } },
      select: { id: true, fullName: true, phoneNumber: true }
    });

    const items = patients
      .map((p) => ({
        patientId: p.id,
        fullName: p.fullName,
        phoneNumber: p.phoneNumber,
        missedCount: mapCounts[p.id] || 0
      }))
      .sort((a, b) => b.missedCount - a.missedCount);

    return { items, total: items.length, since: sinceDate.toISOString() };
  }

  async warnPatientAdherence(
    doctorId: string,
    patientId: string,
    message?: string
  ) {
    // Ensure patient exists and is a patient
    const patient = await this.databaseService.client.user.findUnique({
      where: { id: patientId }
    });
    if (!patient || patient.role !== UserRole.PATIENT || patient.deletedAt) {
      throw new NotFoundException('Patient not found');
    }
    
    // Check if doctor has ACTIVE prescription with this patient
    const activePrescription = await this.databaseService.client.prescription.findFirst({
      where: {
        doctorId: doctorId,
        patientId: patientId,
        status: PrescriptionStatus.ACTIVE
      }
    });
    
    if (!activePrescription) {
      throw new UnprocessableEntityException(
        'Bệnh nhân không thuộc danh sách theo dõi của bác sĩ'
      );
    }
    const doctor = await this.databaseService.client.user.findUnique({
      where: { id: doctorId }
    });

    const alert = await this.databaseService.client.alert.create({
      data: {
        patientId,
        doctorId,
        type: AlertType.LOW_ADHERENCE,
        message:
          message ||
          `Bác sĩ ${doctor?.fullName || ''} nhắc nhở bạn uống thuốc đều đặn và đúng giờ theo chỉ định`,
        resolved: false
      }
    });

    return {
      message: 'Đã gửi cảnh báo tuân thủ cho bệnh nhân',
      alertId: alert.id
    };
  }

  // ==================== Danh sách bệnh nhân với trạng thái adherence và alert type ====================
  async listPatientsWithAdherenceAndAlerts(
    doctorId: string,
    sinceDays: number = 7
  ) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    // Get today's date range for checking today's adherence
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Find all ACTIVE prescriptions of this doctor and collect related patientIds
    const prescriptions =
      await this.databaseService.client.prescription.findMany({
        where: {
          doctorId,
          status: PrescriptionStatus.ACTIVE
        },
        select: { id: true, patientId: true }
      });

    if (prescriptions.length === 0) {
      return { items: [], total: 0, since: sinceDate.toISOString() };
    }

    const patientIds = Array.from(
      new Set(prescriptions.map((p) => p.patientId))
    );
    const prescriptionIds = prescriptions.map((p) => p.id);

    // Get adherence counts by patient (overall period)
    const adherenceCounts =
      await this.databaseService.client.adherenceLog.groupBy({
        by: ['patientId', 'status'],
        where: {
          patientId: { in: patientIds },
          takenAt: { gte: sinceDate },
          prescriptionId: { in: prescriptionIds }
        },
        _count: { _all: true }
      });

    // Get today's adherence counts by patient
    const todayAdherenceCounts =
      await this.databaseService.client.adherenceLog.groupBy({
        by: ['patientId', 'status'],
        where: {
          patientId: { in: patientIds },
          takenAt: {
            gte: startOfToday,
            lt: endOfToday
          },
          prescriptionId: { in: prescriptionIds }
        },
        _count: { _all: true }
      });

    // Get alert counts by patient
    const alertCounts = await this.databaseService.client.alert.groupBy({
      by: ['patientId', 'type'],
      where: {
        patientId: { in: patientIds },
        createdAt: { gte: sinceDate },
        resolved: false
      },
      _count: { _all: true }
    });

    // Get today's warning count by patient (LOW_ADHERENCE alerts created today)
    const todayWarningCounts = await this.databaseService.client.alert.groupBy({
      by: ['patientId'],
      where: {
        patientId: { in: patientIds },
        type: 'LOW_ADHERENCE',
        createdAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      },
      _count: { _all: true }
    });

    // Get total reminder count by patient (all alerts from doctor to patient)
    const totalReminderCounts = await this.databaseService.client.alert.groupBy({
      by: ['patientId'],
      where: {
        patientId: { in: patientIds },
        doctorId: doctorId,
        createdAt: { gte: sinceDate }
      },
      _count: { _all: true }
    });

    // Process overall adherence data
    const adherenceMap: Record<
      string,
      { taken: number; missed: number; skipped: number }
    > = {};
    for (const row of adherenceCounts) {
      const patientId = row.patientId;
      const status = row.status as string;
      const count = (row as any)._count._all as number;

      if (!adherenceMap[patientId]) {
        adherenceMap[patientId] = { taken: 0, missed: 0, skipped: 0 };
      }

      if (status === 'TAKEN') adherenceMap[patientId].taken = count;
      else if (status === 'MISSED') adherenceMap[patientId].missed = count;
      else if (status === 'SKIPPED') adherenceMap[patientId].skipped = count;
    }

    // Process today's adherence data
    const todayAdherenceMap: Record<
      string,
      { taken: number; missed: number; skipped: number }
    > = {};
    for (const row of todayAdherenceCounts) {
      const patientId = row.patientId;
      const status = row.status as string;
      const count = (row as any)._count._all as number;

      if (!todayAdherenceMap[patientId]) {
        todayAdherenceMap[patientId] = { taken: 0, missed: 0, skipped: 0 };
      }

      if (status === 'TAKEN') todayAdherenceMap[patientId].taken = count;
      else if (status === 'MISSED') todayAdherenceMap[patientId].missed = count;
      else if (status === 'SKIPPED') todayAdherenceMap[patientId].skipped = count;
    }

    // Process alert data
    const alertMap: Record<
      string,
      { missedDose: number; lowAdherence: number; other: number }
    > = {};
    for (const row of alertCounts) {
      const patientId = row.patientId;
      const type = row.type as string;
      const count = (row as any)._count._all as number;

      if (!alertMap[patientId]) {
        alertMap[patientId] = { missedDose: 0, lowAdherence: 0, other: 0 };
      }

      if (type === 'MISSED_DOSE') alertMap[patientId].missedDose = count;
      else if (type === 'LOW_ADHERENCE')
        alertMap[patientId].lowAdherence = count;
      else if (type === 'OTHER') alertMap[patientId].other = count;
    }

    // Process today's warning count data
    const todayWarningMap: Record<string, number> = {};
    for (const row of todayWarningCounts) {
      const patientId = row.patientId;
      const count = (row as any)._count._all as number;
      todayWarningMap[patientId] = count;
    }

    // Process total reminder count data
    const totalReminderMap: Record<string, number> = {};
    for (const row of totalReminderCounts) {
      const patientId = row.patientId;
      const count = (row as any)._count._all as number;
      totalReminderMap[patientId] = count;
    }

    // Fetch patient basic info
    const patients = await this.databaseService.client.user.findMany({
      where: { id: { in: patientIds } },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true
      }
    });

    const items = patients.map((patient) => {
      const adherence = adherenceMap[patient.id] || {
        taken: 0,
        missed: 0,
        skipped: 0
      };
      const todayAdherence = todayAdherenceMap[patient.id] || {
        taken: 0,
        missed: 0,
        skipped: 0
      };
      const alerts = alertMap[patient.id] || {
        missedDose: 0,
        lowAdherence: 0,
        other: 0
      };
      const todayWarningCount = todayWarningMap[patient.id] || 0;
      const totalReminderCount = totalReminderMap[patient.id] || 0;

      // Determine primary status based on overall adherence
      let primaryStatus: 'TAKEN' | 'MISSED' | 'MIXED' = 'TAKEN';
      if (adherence.missed > 0 && adherence.taken === 0) {
        primaryStatus = 'MISSED';
      } else if (adherence.missed > 0 && adherence.taken > 0) {
        primaryStatus = 'MIXED';
      }

      // Determine today's status
      let todayStatus: 'COMPLIANT' | 'PARTIAL' | 'MISSED' | 'NO_DATA' = 'NO_DATA';
      if (todayAdherence.taken > 0 && todayAdherence.missed === 0) {
        todayStatus = 'COMPLIANT'; // Đã tuân thủ hôm nay
      } else if (todayAdherence.taken > 0 && todayAdherence.missed > 0) {
        todayStatus = 'PARTIAL'; // Tuân thủ một phần
      } else if (todayAdherence.missed > 0 && todayAdherence.taken === 0) {
        todayStatus = 'MISSED'; // Bỏ lỡ hôm nay
      }

      return {
        patientId: patient.id,
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber,
        adherence,
        todayAdherence,
        alerts,
        primaryStatus,
        todayStatus,
        todayWarningCount,
        totalReminderCount,
        totalMissed: adherence.missed,
        totalTaken: adherence.taken,
        totalAlerts: alerts.missedDose + alerts.lowAdherence + alerts.other
      };
    });

    // Sort by missed count descending, then by taken count ascending
    items.sort((a, b) => {
      if (b.totalMissed !== a.totalMissed) {
        return b.totalMissed - a.totalMissed;
      }
      return a.totalTaken - b.totalTaken;
    });

    return { items, total: items.length, since: sinceDate.toISOString() };
  }

  // Test WebSocket notification
  async testWebSocketNotification(doctorId: string) {
    // Import WebSocket gateway dynamically to avoid circular dependency
    const { MedicalManagementGateway } = await import('@/modules/notifications/websocket.gateway');
    const gateway = new MedicalManagementGateway();

    gateway.notifyDoctorAdherenceUpdate(doctorId, 'test-patient-id', 'TAKEN');

    return {
      message: 'WebSocket test notification sent',
      doctorId,
      timestamp: new Date().toISOString()
    };
  }

  // CRUD Operations for Doctor Management
  async createDoctor(body: {
    fullName: string;
    phoneNumber: string;
    password: string;
    majorDoctor: string;
  }) {
    // Validation
    if (!body.fullName?.trim()) {
      throw new UnprocessableEntityException('Full name is required');
    }
    if (!body.phoneNumber?.trim()) {
      throw new UnprocessableEntityException('Phone number is required');
    }
    if (!body.password?.trim()) {
      throw new UnprocessableEntityException('Password is required');
    }
    if (!body.majorDoctor?.trim()) {
      throw new UnprocessableEntityException('Major doctor is required');
    }

    // Check if phone number already exists
    const existing = await this.databaseService.client.user.findFirst({
      where: { phoneNumber: body.phoneNumber }
    });
    if (existing) {
      throw new UnprocessableEntityException('Phone number already exists');
    }

    // Validate majorDoctor exists
    const majorDoctorExists = await this.databaseService.client.majorDoctorTable.findUnique({
      where: { id: body.majorDoctor }
    });
    if (!majorDoctorExists) {
      throw new UnprocessableEntityException('Invalid major doctor');
    }

    const hashedPassword = await Utils.HashUtils.hashPassword(body.password);

    const doctor = await this.databaseService.client.user.create({
      data: {
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        role: UserRole.DOCTOR,
        majorDoctorId: body.majorDoctor,
        status: UserStatus.ACTIVE
      }
    });

    return doctor;
  }

  async updateDoctor(
    id: string,
    body: {
      fullName?: string;
      phoneNumber?: string;
      majorDoctor?: string;
      status?: string;
    }
  ) {
    const doctor = await this.getDoctor(id);

    // Validate majorDoctor if provided
    if (body.majorDoctor) {
      const majorDoctorExists = await this.databaseService.client.majorDoctorTable.findUnique({
        where: { id: body.majorDoctor }
      });
      if (!majorDoctorExists) {
        throw new UnprocessableEntityException('Invalid major doctor');
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = Object.values(UserStatus);
      if (!validStatuses.includes(body.status as UserStatus)) {
        throw new UnprocessableEntityException('Invalid status');
      }
    }

    // Check phone number uniqueness if being updated
    if (body.phoneNumber && body.phoneNumber !== doctor.phoneNumber) {
      const existing = await this.databaseService.client.user.findFirst({
        where: { phoneNumber: body.phoneNumber }
      });
      if (existing) {
        throw new UnprocessableEntityException('Phone number already exists');
      }
    }

    const updatedDoctor = await this.databaseService.client.user.update({
      where: { id },
      data: {
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        majorDoctorId: body.majorDoctor,
        status: body.status as UserStatus
      }
    });

    return updatedDoctor;
  }

  async deleteDoctor(id: string) {
    const doctor = await this.getDoctor(id);

    // Soft delete
    await this.databaseService.client.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return { message: 'Doctor deleted successfully' };
  }

  async getDoctor(id: string) {
    const doctor = await this.databaseService.client.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!doctor || doctor.role !== UserRole.DOCTOR || doctor.deletedAt) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
