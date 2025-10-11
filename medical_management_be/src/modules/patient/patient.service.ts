import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AdherenceStatus, PrescriptionStatus } from '@prisma/client';
import { Utils } from '@/utils/utils';

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

  async listHistory(
    patientId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    console.log('=== PATIENT LIST HISTORY DEBUG ===');
    console.log('Patient ID:', patientId);
    console.log('Params:', params);

    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params?.sortBy || 'createdAt';
    const orderDir = params?.sortOrder || 'desc';

    // Include all prescriptions for history (not just completed/cancelled)
    const where: any = {
      patientId
    };

    console.log('Where clause:', where);
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

    console.log('Query results:');
    console.log('Items count:', items.length);
    console.log('Total count:', total);
    console.log(
      'Items:',
      items.map((item) => ({
        id: item.id,
        status: item.status,
        startDate: item.startDate
      }))
    );

    return { items, total, page, limit };
  }

  async getReminders(patientId: string, date?: string) {
    const items = await this.databaseService.client.prescriptionItem.findMany({
      where: { prescription: { patientId, status: PrescriptionStatus.ACTIVE } },
      include: { prescription: true, medication: true }
    });

    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    );

    const adherenceLogs =
      await this.databaseService.client.adherenceLog.findMany({
        where: {
          patientId,
          takenAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

    // Expand to schedule entries
    const reminders: Array<{
      id: string;
      date: string;
      time: string;
      prescriptionId: string;
      prescriptionItemId: string;
      uniqueDoseId: string;
      medicationName: string;
      dosage: string;
      status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
      route?: string;
      instructions?: string;
    }> = [];

    for (const item of items) {
      const start = new Date(item.prescription.startDate);
      const end = item.prescription.endDate
        ? new Date(item.prescription.endDate)
        : new Date(start.getTime() + item.durationDays * 24 * 60 * 60 * 1000);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        for (const t of item.timesOfDay) {
          const reminderDate = d.toISOString().slice(0, 10);

          // Create unique dose ID for this specific time slot
          const uniqueDoseId = `${item.id}-${reminderDate}-${t}`;

          // Check if this specific dose has been logged
          const relevantLog = adherenceLogs.find(
            (log) =>
              log.prescriptionItemId === item.id && log.notes === uniqueDoseId // Use notes field to store uniqueDoseId
          );

          console.log(`=== DOSE ID DEBUG ===`);
          console.log(`Unique dose ID: ${uniqueDoseId}`);
          console.log(
            `Found log:`,
            relevantLog
              ? {
                  id: relevantLog.id,
                  status: relevantLog.status,
                  notes: relevantLog.notes
                }
              : 'null'
          );

          let status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED' = 'PENDING';
          if (relevantLog) {
            status = relevantLog.status as 'TAKEN' | 'MISSED' | 'SKIPPED';
          }

          reminders.push({
            id: uniqueDoseId, // Unique ID for each specific doseh
            date: reminderDate,
            time: t,
            prescriptionId: item.prescriptionId,
            prescriptionItemId: item.id,
            uniqueDoseId: uniqueDoseId, // Add this field for backend tracking
            medicationName: item.medication.name,
            dosage: item.dosage,
            status,
            route: item.route,
            instructions: item.instructions
          });
        }
      }
    }

    // Filter to only show reminders for the target date
    const targetDateString = targetDate.toISOString().slice(0, 10);
    const filteredReminders = reminders.filter(
      (r) => r.date === targetDateString
    );

    console.log('=== GET REMINDERS DEBUG ===');
    console.log('Target date:', targetDateString);
    console.log('Total reminders generated:', reminders.length);
    console.log('Filtered reminders:', filteredReminders.length);
    console.log('Adherence logs count:', adherenceLogs.length);
    console.log('Sample reminders:', filteredReminders.slice(0, 2));

    return filteredReminders;
  }

  async confirmIntake(
    patientId: string,
    prescriptionId: string,
    body: {
      prescriptionItemId: string;
      takenAt: string;
      status: AdherenceStatus;
      notes?: string;
    }
  ) {
    const p = await this.databaseService.client.prescription.findFirst({
      where: { id: prescriptionId, patientId }
    });
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
      orderBy: { takenAt: 'desc' },
      include: {
        prescription: {
          include: {
            doctor: {
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
                strength: true,
                form: true
              }
            }
          }
        }
      }
    });
    return logs;
  }

  async listAlerts(patientId: string) {
    return this.databaseService.client.alert.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async overview(patientId: string) {
    const [activePrescriptions, takenLogs, missedLogs, unresolvedAlerts] =
      await Promise.all([
        this.databaseService.client.prescription.count({
          where: { patientId, status: 'ACTIVE' }
        }),
        this.databaseService.client.adherenceLog.count({
          where: { patientId, status: AdherenceStatus.TAKEN }
        }),
        this.databaseService.client.adherenceLog.count({
          where: { patientId, status: AdherenceStatus.MISSED }
        }),
        this.databaseService.client.alert.count({
          where: { patientId, resolved: false }
        })
      ]);
    return { activePrescriptions, takenLogs, missedLogs, unresolvedAlerts };
  }

  // Danh sách tất cả bệnh nhân (join User + PatientProfile)
  async listAllPatients(params?: { page?: number; limit?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    
    const where = {
      role: 'PATIENT' as any,
      deletedAt: null // Chỉ lấy các record chưa bị soft delete
    };
    
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          createdAt: true,
          createdBy: true,
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
              majorDoctor: true
            }
          },
          profile: {
            select: {
              gender: true,
              birthDate: true,
              address: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    
    return { 
      data: items, 
      pagination: { total, page, limit }
    };
  }

  async searchPatients(query: { q?: string; page?: number; limit?: number }) {
    const q = (query.q || '').trim();
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    const where: any = {
      role: 'PATIENT',
      deletedAt: null // Chỉ tìm trong các record chưa bị soft delete
    };
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q } }
      ];
    }
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          createdAt: true,
          createdBy: true,
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          },
          profile: {
            select: { gender: true, birthDate: true, address: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    return { data: items, total, page, limit };
  }

  async getPatientDetailForDoctor(patientId: string) {
    console.log('=== GET PATIENT DETAIL DEBUG ===');
    console.log('Patient ID:', patientId);

    const result = await this.databaseService.client.user.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        createdBy: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        profile: {
          select: {
            gender: true,
            birthDate: true,
            address: true
          }
        },
        medicalHistory: {
          select: {
            id: true,
            conditions: true,
            allergies: true,
            surgeries: true,
            familyHistory: true,
            lifestyle: true,
            currentMedications: true,
            notes: true,
            extras: true
          }
        }
      }
    });

    console.log('Query result:', {
      id: result?.id,
      createdBy: result?.createdBy,
      createdByUser: result?.createdByUser
    });
    console.log('=== END GET PATIENT DETAIL DEBUG ===');

    return result;
  }

  async updatePatient(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      password?: string;
      role?: string;
      status?: string;
      profile?: {
        gender?: string;
        birthDate?: string;
        address?: string;
        birthYear?: number;
      };
    }
  ) {
    const tx = this.databaseService.client;
    const { fullName, phoneNumber, password, role, status, profile } =
      data || {};

    // Prepare update data
    const updateData: any = {
      fullName: fullName ?? undefined,
      phoneNumber: phoneNumber ?? undefined
    };

    // Add password if provided
    if (password) {
      updateData.password = await Utils.HashUtils.hashPassword(password);
    }

    // Add role if provided
    if (role) {
      updateData.role = role as any;
    }

    // Add status if provided
    if (status) {
      updateData.status = status as any;
    }

    // Handle profile update
    if (profile) {
      const profileData: any = {};

      // Only include gender if it's not empty and valid
      if (profile.gender && profile.gender.trim() !== '') {
        profileData.gender = profile.gender as any;
      }

      // Handle birth date
      if (profile.birthDate) {
        profileData.birthDate = new Date(profile.birthDate);
      } else if (profile.birthYear) {
        profileData.birthDate = new Date(profile.birthYear, 0, 1);
      }

      // Only include address if it's not empty
      if (profile.address && profile.address.trim() !== '') {
        profileData.address = profile.address;
      }

      // Only create profile update if there's data to update
      if (Object.keys(profileData).length > 0) {
        updateData.profile = {
          upsert: {
            create: profileData,
            update: profileData
          }
        };
      }
    }

    const updated = await tx.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        profile: {
          select: {
            gender: true,
            birthDate: true,
            address: true
          }
        }
      }
    });
    return updated;
  }

  async deletePatient(id: string) {
    // Hard delete - xóa thật khỏi database
    return this.databaseService.client.user.delete({
      where: { id },
      select: { id: true }
    });
  }

  async getPatientAllFields(id: string) {
    const patient = await this.databaseService.client.user.findUnique({
      where: { id },
      include: {
        profile: true,
        medicalHistory: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            role: true,
            majorDoctor: true
          }
        },
        prescriptionsAsPatient: {
          include: {
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
                medication: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        adherenceLogs: {
          include: {
            prescriptionItem: {
              include: {
                medication: true
              }
            }
          },
          orderBy: {
            takenAt: 'desc'
          },
          take: 10
        },
        alertsAsPatient: {
          include: {
            doctor: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Tính toán thống kê
    const totalPrescriptions = await this.databaseService.client.prescription.count({
      where: { patientId: id }
    });

    const activePrescriptions = await this.databaseService.client.prescription.count({
      where: { 
        patientId: id,
        status: 'ACTIVE' as any
      }
    });

    const totalAdherenceLogs = await this.databaseService.client.adherenceLog.count({
      where: { patientId: id }
    });

    const takenLogs = await this.databaseService.client.adherenceLog.count({
      where: { 
        patientId: id,
        status: AdherenceStatus.TAKEN
      }
    });

    const missedLogs = await this.databaseService.client.adherenceLog.count({
      where: { 
        patientId: id,
        status: AdherenceStatus.MISSED
      }
    });

    const totalAlerts = await this.databaseService.client.alert.count({
      where: { patientId: id }
    });

    const unresolvedAlerts = await this.databaseService.client.alert.count({
      where: { 
        patientId: id,
        resolved: false
      }
    });

    const adherenceRate = totalAdherenceLogs > 0 ? (takenLogs / totalAdherenceLogs) * 100 : 0;

    return {
      ...patient,
      stats: {
        totalPrescriptions,
        activePrescriptions,
        totalAdherenceLogs,
        takenLogs,
        missedLogs,
        adherenceRate: Math.round(adherenceRate * 100) / 100,
        totalAlerts,
        unresolvedAlerts
      }
    };
  }

  async updatePatientFields(
    id: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      password?: string;
      gender?: string;
      birthDate?: string;
      address?: string;
    }
  ) {
    // Kiểm tra patient có tồn tại
    const patient = await this.databaseService.client.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!patient || patient.role !== 'PATIENT' || patient.deletedAt) {
      throw new NotFoundException('Patient not found');
    }

    // Kiểm tra phone number uniqueness nếu được update
    if (data.phoneNumber && data.phoneNumber !== patient.phoneNumber) {
      const existing = await this.databaseService.client.user.findFirst({
        where: { phoneNumber: data.phoneNumber }
      });
      if (existing) {
        throw new NotFoundException('Số điện thoại đã được sử dụng');
      }
    }

    // Prepare update data for User table
    const updateData: any = {};
    
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.password) {
      updateData.password = await Utils.HashUtils.hashPassword(data.password);
    }

    // Update patient basic info
    if (Object.keys(updateData).length > 0) {
      await this.databaseService.client.user.update({
        where: { id },
        data: updateData
      });
    }

    // Prepare update data for PatientProfile
    const profileUpdateData: any = {};
    
    if (data.gender) profileUpdateData.gender = data.gender;
    if (data.birthDate !== undefined) profileUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.address !== undefined) profileUpdateData.address = data.address;

    // Update or create PatientProfile
    if (Object.keys(profileUpdateData).length > 0) {
      if (patient.profile) {
        // Update existing profile
        await this.databaseService.client.patientProfile.update({
          where: { id: patient.profile.id },
          data: profileUpdateData
        });
      } else {
        // Create new profile if doesn't exist
        await this.databaseService.client.patientProfile.create({
          data: {
            userId: id,
            ...profileUpdateData
          }
        });
      }
    }

    // Return updated full fields
    return this.getPatientAllFields(id);
  }
}
