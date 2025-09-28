import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AlertType } from '@prisma/client';

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
        take: limit,
        include: {
          prescription: {
            select: {
              id: true,
              patient: {
                select: {
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          },
          patient: {
            select: {
              fullName: true,
              phoneNumber: true
            }
          }
        }
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
        take: limit,
        include: {
          prescription: {
            select: {
              id: true,
              doctor: {
                select: {
                  fullName: true,
                  majorDoctor: true
                }
              }
            }
          },
          doctor: {
            select: {
              fullName: true,
              majorDoctor: true
            }
          }
        }
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

  // ==================== MEDICATION REMINDERS ====================

  async createMedicationReminder(data: {
    prescriptionId: string;
    patientId: string;
    doctorId?: string;
    type: AlertType;
    message: string;
  }) {
    console.log('=== CREATE MEDICATION REMINDER DEBUG ===');
    console.log('Reminder data:', data);

    const alert = await this.databaseService.client.alert.create({
      data: {
        prescriptionId: data.prescriptionId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: data.type,
        message: data.message,
        resolved: false
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
        patient: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });

    console.log('Created medication reminder:', alert.id);
    console.log('=== END CREATE MEDICATION REMINDER DEBUG ===');

    return alert;
  }

  async createMissedDoseAlert(prescriptionId: string, patientId: string, doctorId?: string) {
    const prescription = await this.databaseService.client.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          select: { fullName: true }
        },
        items: {
          include: {
            medication: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    const medicationNames = prescription.items.map(item => item.medication.name).join(', ');
    const message = `Nhắc nhở: Bạn đã bỏ lỡ liều thuốc ${medicationNames}. Vui lòng uống thuốc đúng giờ theo chỉ định của bác sĩ.`;

    return this.createMedicationReminder({
      prescriptionId,
      patientId,
      doctorId,
      type: 'MISSED_DOSE',
      message
    });
  }

  async createLowAdherenceAlert(prescriptionId: string, patientId: string, doctorId?: string) {
    const prescription = await this.databaseService.client.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          select: { fullName: true }
        },
        items: {
          include: {
            medication: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    const medicationNames = prescription.items.map(item => item.medication.name).join(', ');
    const message = `Cảnh báo: Tỷ lệ tuân thủ uống thuốc ${medicationNames} của bạn đang thấp. Vui lòng tuân thủ đúng lịch uống thuốc để đạt hiệu quả điều trị tốt nhất.`;

    return this.createMedicationReminder({
      prescriptionId,
      patientId,
      doctorId,
      type: 'LOW_ADHERENCE',
      message
    });
  }

  async getUnresolvedAlertsForPatient(patientId: string) {
    return this.databaseService.client.alert.findMany({
      where: {
        patientId,
        resolved: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        prescription: {
          select: {
            id: true,
            doctor: {
              select: {
                fullName: true,
                majorDoctor: true
              }
            }
          }
        }
      }
    });
  }

  async getUnresolvedAlertsForDoctor(doctorId: string) {
    return this.databaseService.client.alert.findMany({
      where: {
        doctorId,
        resolved: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        prescription: {
          select: {
            id: true,
            patient: {
              select: {
                fullName: true,
                phoneNumber: true
              }
            }
          }
        },
        patient: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });
  }

  async markAllAsResolvedForPatient(patientId: string) {
    return this.databaseService.client.alert.updateMany({
      where: {
        patientId,
        resolved: false
      },
      data: {
        resolved: true
      }
    });
  }

  async markAllAsResolvedForDoctor(doctorId: string) {
    return this.databaseService.client.alert.updateMany({
      where: {
        doctorId,
        resolved: false
      },
      data: {
        resolved: true
      }
    });
  }

  // ==================== SCHEDULED REMINDERS ====================

  async scheduleMedicationReminders() {
    console.log('=== SCHEDULE MEDICATION REMINDERS DEBUG ===');
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Get active prescriptions with scheduled times matching current time
    const activePrescriptions = await this.databaseService.client.prescription.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      include: {
        items: {
          include: {
            medication: {
              select: {
                name: true,
                strength: true
              }
            }
          }
        },
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
            fullName: true
          }
        }
      }
    });

    const remindersToCreate = [];

    for (const prescription of activePrescriptions) {
      for (const item of prescription.items) {
        if (item.timesOfDay.includes(currentTime)) {
          const medicationName = `${item.medication.name} ${item.medication.strength || ''}`.trim();
          const message = `🔔 Nhắc nhở uống thuốc: ${medicationName} - ${item.dosage} vào lúc ${currentTime}`;
          
          remindersToCreate.push({
            prescriptionId: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            type: 'OTHER' as AlertType,
            message
          });
        }
      }
    }

    // Create reminders
    if (remindersToCreate.length > 0) {
      console.log(`Creating ${remindersToCreate.length} medication reminders for time ${currentTime}`);
      
      for (const reminderData of remindersToCreate) {
        await this.createMedicationReminder(reminderData);
      }
    } else {
      console.log(`No medication reminders needed for time ${currentTime}`);
    }

    console.log('=== END SCHEDULE MEDICATION REMINDERS DEBUG ===');
    return remindersToCreate.length;
  }
}
