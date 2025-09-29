import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AdherenceStatus, PrescriptionStatus } from '@prisma/client';
import { Utils } from '@/utils/utils';

@Injectable()
export class PatientService {
  constructor(private readonly databaseService: DatabaseService) { }

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
    console.log('Items:', items.map(item => ({ id: item.id, status: item.status, startDate: item.startDate })));

    return { items, total, page, limit };
  }

  async getReminders(patientId: string, date?: string) {
    const items = await this.databaseService.client.prescriptionItem.findMany({
      where: { prescription: { patientId, status: PrescriptionStatus.ACTIVE } },
      include: { prescription: true, medication: true }
    });
    
    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    const adherenceLogs = await this.databaseService.client.adherenceLog.findMany({
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
          const relevantLog = adherenceLogs.find(log => 
            log.prescriptionItemId === item.id && 
            log.notes === uniqueDoseId // Use notes field to store uniqueDoseId
          );
          
          console.log(`=== DOSE ID DEBUG ===`);
          console.log(`Unique dose ID: ${uniqueDoseId}`);
          console.log(`Found log:`, relevantLog ? { id: relevantLog.id, status: relevantLog.status, notes: relevantLog.notes } : 'null');
          
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
    const filteredReminders = reminders.filter(r => r.date === targetDateString);
    
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
      orderBy: { takenAt: 'desc' }
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
  async listAllPatients() {
    return this.databaseService.client.user.findMany({
      where: {
        role: 'PATIENT',
        deletedAt: null // Chỉ lấy các record chưa bị soft delete
      },
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
          select: {
            gender: true,
            birthDate: true,
            address: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
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
    const { fullName, phoneNumber, password, role, status, profile } = data || {};
    
    // Prepare update data
    const updateData: any = {
      fullName: fullName ?? undefined,
      phoneNumber: phoneNumber ?? undefined,
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
}
