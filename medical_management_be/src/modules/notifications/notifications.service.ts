import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { AlertType, AdherenceStatus } from '@prisma/client';
import { SendReminderDto, QuickConfirmDto, MedicationScheduleQueryDto, AdherenceReportQueryDto } from '@/schemas/medication-reminder.schema';

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

  async createMissedDoseAlert(
    prescriptionId: string,
    patientId: string,
    doctorId?: string
  ) {
    const prescription =
      await this.databaseService.client.prescription.findUnique({
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

    const medicationNames = prescription.items
      .map((item) => item.medication.name)
      .join(', ');
    const message = `Nhắc nhở: Bạn đã bỏ lỡ liều thuốc ${medicationNames}. Vui lòng uống thuốc đúng giờ theo chỉ định của bác sĩ.`;

    return this.createMedicationReminder({
      prescriptionId,
      patientId,
      doctorId,
      type: 'MISSED_DOSE',
      message
    });
  }

  async createLowAdherenceAlert(
    prescriptionId: string,
    patientId: string,
    doctorId?: string
  ) {
    const prescription =
      await this.databaseService.client.prescription.findUnique({
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

    const medicationNames = prescription.items
      .map((item) => item.medication.name)
      .join(', ');
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
    const activePrescriptions =
      await this.databaseService.client.prescription.findMany({
        where: {
          status: 'ACTIVE',
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }]
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
          const medicationName =
            `${item.medication.name} ${item.medication.strength || ''}`.trim();
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
      console.log(
        `Creating ${remindersToCreate.length} medication reminders for time ${currentTime}`
      );

      for (const reminderData of remindersToCreate) {
        await this.createMedicationReminder(reminderData);
      }
    } else {
      console.log(`No medication reminders needed for time ${currentTime}`);
    }

    console.log('=== END SCHEDULE MEDICATION REMINDERS DEBUG ===');
    return remindersToCreate.length;
  }

  // ==================== ENHANCED MEDICATION REMINDER FUNCTIONS ====================

  /**
   * Gửi nhắc nhở thủ công từ bác sĩ
   */
  async sendManualReminder(doctorId: string, data: SendReminderDto) {
    // Kiểm tra bác sĩ có quyền gửi nhắc nhở cho đơn thuốc này không
    const prescription = await this.databaseService.client.prescription.findFirst({
      where: {
        id: data.prescriptionId,
        doctorId: doctorId,
        status: 'ACTIVE'
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        items: {
          select: {
            id: true
          }
        }
      }
    });

    if (!prescription) {
      throw new Error('Không tìm thấy đơn thuốc hoặc bạn không có quyền gửi nhắc nhở');
    }

    // Kiểm tra đơn thuốc có items (thuốc) không
    if (!prescription.items || prescription.items.length === 0) {
      throw new Error('Đơn thuốc không có thuốc nào. Vui lòng thêm thuốc vào đơn trước khi gửi nhắc nhở');
    }

    // Tạo alert nhắc nhở
    const alert = await this.databaseService.client.alert.create({
      data: {
        prescriptionId: data.prescriptionId,
        patientId: prescription.patientId,
        doctorId: doctorId,
        type: data.type,
        message: data.message,
        resolved: false
      },
      include: {
        patient: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });

    return alert;
  }

  /**
   * Xác nhận uống thuốc nhanh cho bệnh nhân
   */
  async quickConfirmMedication(patientId: string, data: QuickConfirmDto) {
    console.log('=== QUICK CONFIRM SERVICE DEBUG ===');
    console.log('Patient ID:', patientId);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    // Nếu prescriptionItemId là format "item-123-2024-01-15-08:00", extract UUID
    let prescriptionItemId = data.prescriptionItemId;
    if (prescriptionItemId.includes('-') && !prescriptionItemId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Extract UUID from format like "item-123-2024-01-15-08:00"
      prescriptionItemId = prescriptionItemId.split('-')[1]; // Lấy phần thứ 2 (UUID)
      console.log('Extracted prescriptionItemId:', prescriptionItemId);
    }
    
    // Kiểm tra prescription item thuộc về bệnh nhân này
    const prescriptionItem = await this.databaseService.client.prescriptionItem.findFirst({
      where: {
        id: prescriptionItemId,
        prescription: {
          patientId: patientId,
          status: 'ACTIVE'
        }
      },
      include: {
        prescription: true,
        medication: true
      }
    });

    if (!prescriptionItem) {
      throw new Error(`Không tìm thấy thuốc hoặc đơn thuốc không còn hiệu lực. ID: ${prescriptionItemId}`);
    }
    
    console.log('Found prescription item:', prescriptionItem.id);
    console.log('=== END QUICK CONFIRM SERVICE DEBUG ===');

    // Tạo adherence log
    const adherenceLog = await this.databaseService.client.adherenceLog.create({
      data: {
        prescriptionId: prescriptionItem.prescriptionId,
        prescriptionItemId: data.prescriptionItemId,
        patientId: patientId,
        takenAt: data.takenAt ? new Date(data.takenAt) : new Date(),
        status: AdherenceStatus.TAKEN,
        amount: data.amount,
        notes: data.notes
      },
      include: {
        prescriptionItem: {
          include: {
            medication: true
          }
        }
      }
    });

    // Tự động resolve các alert liên quan
    await this.databaseService.client.alert.updateMany({
      where: {
        prescriptionId: prescriptionItem.prescriptionId,
        patientId: patientId,
        resolved: false,
        type: 'MISSED_DOSE'
      },
      data: {
        resolved: true
      }
    });

    return adherenceLog;
  }

  /**
   * Lấy lịch uống thuốc cho bệnh nhân
   */
  async getMedicationSchedule(patientId: string, query: MedicationScheduleQueryDto) {
    const targetDate = query.date ? new Date(query.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Lấy các prescription items cần uống trong ngày
    const prescriptionItems = await this.databaseService.client.prescriptionItem.findMany({
      where: {
        prescription: {
          patientId: patientId,
          status: 'ACTIVE',
          startDate: { lte: endOfDay },
          OR: [
            { endDate: null },
            { endDate: { gte: startOfDay } }
          ]
        }
      },
      include: {
        medication: true,
        prescription: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            notes: true
          }
        },
        logs: {
          where: {
            takenAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          orderBy: {
            takenAt: 'desc'
          }
        }
      }
    });

    // Tạo schedule cho từng thời điểm uống thuốc
    const schedule = [];
    for (const item of prescriptionItems) {
      for (const timeOfDay of item.timesOfDay) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        const scheduledTime = new Date(targetDate);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Kiểm tra xem đã uống chưa
        const takenLog = item.logs.find(log => {
          const logTime = new Date(log.takenAt);
          return Math.abs(logTime.getTime() - scheduledTime.getTime()) < 30 * 60 * 1000; // 30 phút tolerance
        });

        schedule.push({
          id: `${item.id}-${timeOfDay}`,
          prescriptionItemId: item.id,
          medication: item.medication,
          dosage: item.dosage,
          scheduledTime: scheduledTime.toISOString(),
          timeOfDay: timeOfDay,
          status: takenLog ? takenLog.status : 'PENDING',
          takenAt: takenLog?.takenAt,
          amount: takenLog?.amount,
          notes: takenLog?.notes,
          instructions: item.instructions
        });
      }
    }

    // Sắp xếp theo thời gian
    schedule.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    return {
      date: targetDate.toISOString().split('T')[0],
      schedule,
      summary: {
        total: schedule.length,
        taken: schedule.filter(s => s.status === 'TAKEN').length,
        missed: schedule.filter(s => s.status === 'MISSED').length,
        pending: schedule.filter(s => s.status === 'PENDING').length
      }
    };
  }

  /**
   * Lấy báo cáo tuân thủ cho bác sĩ
   */
  async getAdherenceReport(query: AdherenceReportQueryDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Lấy tất cả adherence logs trong khoảng thời gian
    const adherenceLogs = await this.databaseService.client.adherenceLog.findMany({
      where: {
        patientId: query.patientId,
        takenAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        prescriptionItem: {
          include: {
            medication: true
          }
        },
        prescription: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        takenAt: 'asc'
      }
    });

    // Tính toán tỷ lệ tuân thủ
    const totalDoses = adherenceLogs.length;
    const takenDoses = adherenceLogs.filter(log => log.status === AdherenceStatus.TAKEN).length;
    const missedDoses = adherenceLogs.filter(log => log.status === AdherenceStatus.MISSED).length;
    const skippedDoses = adherenceLogs.filter(log => log.status === AdherenceStatus.SKIPPED).length;

    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    return {
      patientId: query.patientId,
      period: {
        startDate: query.startDate,
        endDate: query.endDate
      },
      summary: {
        totalDoses,
        takenDoses,
        missedDoses,
        skippedDoses,
        adherenceRate: Math.round(adherenceRate * 100) / 100
      },
      logs: adherenceLogs,
      trends: this.calculateAdherenceTrends(adherenceLogs, query.groupBy)
    };
  }

  /**
   * Tính toán xu hướng tuân thủ
   */
  private calculateAdherenceTrends(logs: any[], groupBy: string) {
    const groups = new Map();
    
    logs.forEach(log => {
      const date = new Date(log.takenAt);
      let key: string;
      
      switch (groupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups.has(key)) {
        groups.set(key, { taken: 0, missed: 0, skipped: 0, total: 0 });
      }
      
      const group = groups.get(key);
      group.total++;
      group[log.status.toLowerCase()]++;
    });

    return Array.from(groups.entries()).map(([date, stats]) => ({
      date,
      ...stats,
      adherenceRate: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100 * 100) / 100 : 0
    }));
  }

  /**
   * Lấy thuốc sắp uống (trong 30 phút tới)
   */
  async getUpcomingMedications(patientId: string) {
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

    const schedule = await this.getMedicationSchedule(patientId, {});
    
    const upcoming = schedule.schedule.filter(item => {
      const scheduledTime = new Date(item.scheduledTime);
      return scheduledTime >= now && scheduledTime <= in30Minutes && item.status === 'PENDING';
    });

    return upcoming;
  }
}
