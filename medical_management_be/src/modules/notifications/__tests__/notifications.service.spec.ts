import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { DatabaseService } from '@/core/database/database.service';
import { AdherenceStatus } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    client: {
      alert: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      prescription: {
        findFirst: jest.fn(),
      },
      prescriptionItem: {
        findFirst: jest.fn(),
      },
      adherenceLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendManualReminder', () => {
    it('should send manual reminder successfully', async () => {
      const doctorId = 'doctor-123';
      const reminderData = {
        prescriptionId: 'prescription-123',
        message: 'Nhắc nhở uống thuốc',
        type: 'MISSED_DOSE' as const,
      };

      const mockPrescription = {
        id: 'prescription-123',
        patientId: 'patient-123',
        doctorId: 'doctor-123',
        status: 'ACTIVE',
        patient: {
          id: 'patient-123',
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0123456789',
        },
      };

      const mockAlert = {
        id: 'alert-123',
        prescriptionId: 'prescription-123',
        patientId: 'patient-123',
        doctorId: 'doctor-123',
        type: 'MISSED_DOSE',
        message: 'Nhắc nhở uống thuốc',
        resolved: false,
        patient: {
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0123456789',
        },
      };

      mockDatabaseService.client.prescription.findFirst.mockResolvedValue(mockPrescription);
      mockDatabaseService.client.alert.create.mockResolvedValue(mockAlert);

      const result = await service.sendManualReminder(doctorId, reminderData);

      expect(mockDatabaseService.client.prescription.findFirst).toHaveBeenCalledWith({
        where: {
          id: reminderData.prescriptionId,
          doctorId: doctorId,
          status: 'ACTIVE',
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
            },
          },
        },
      });

      expect(mockDatabaseService.client.alert.create).toHaveBeenCalledWith({
        data: {
          prescriptionId: reminderData.prescriptionId,
          patientId: mockPrescription.patientId,
          doctorId: doctorId,
          type: reminderData.type,
          message: reminderData.message,
          resolved: false,
        },
        include: {
          patient: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
        },
      });

      expect(result).toEqual(mockAlert);
    });

    it('should throw error when prescription not found', async () => {
      const doctorId = 'doctor-123';
      const reminderData = {
        prescriptionId: 'prescription-123',
        message: 'Nhắc nhở uống thuốc',
        type: 'MISSED_DOSE' as const,
      };

      mockDatabaseService.client.prescription.findFirst.mockResolvedValue(null);

      await expect(service.sendManualReminder(doctorId, reminderData)).rejects.toThrow(
        'Không tìm thấy đơn thuốc hoặc bạn không có quyền gửi nhắc nhở'
      );
    });
  });

  describe('quickConfirmMedication', () => {
    it('should confirm medication successfully', async () => {
      const patientId = 'patient-123';
      const confirmData = {
        prescriptionItemId: 'item-123',
        amount: '1 viên',
        notes: 'Đã uống sau ăn',
      };

      const mockPrescriptionItem = {
        id: 'item-123',
        prescriptionId: 'prescription-123',
        prescription: {
          id: 'prescription-123',
          patientId: 'patient-123',
          status: 'ACTIVE',
        },
        medication: {
          id: 'med-123',
          name: 'Paracetamol',
        },
      };

      const mockAdherenceLog = {
        id: 'log-123',
        prescriptionId: 'prescription-123',
        prescriptionItemId: 'item-123',
        patientId: 'patient-123',
        takenAt: new Date(),
        status: AdherenceStatus.TAKEN,
        amount: '1 viên',
        notes: 'Đã uống sau ăn',
        prescriptionItem: {
          medication: {
            name: 'Paracetamol',
          },
        },
      };

      mockDatabaseService.client.prescriptionItem.findFirst.mockResolvedValue(mockPrescriptionItem);
      mockDatabaseService.client.adherenceLog.create.mockResolvedValue(mockAdherenceLog);
      mockDatabaseService.client.alert.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.quickConfirmMedication(patientId, confirmData);

      expect(mockDatabaseService.client.prescriptionItem.findFirst).toHaveBeenCalledWith({
        where: {
          id: confirmData.prescriptionItemId,
          prescription: {
            patientId: patientId,
            status: 'ACTIVE',
          },
        },
        include: {
          prescription: true,
          medication: true,
        },
      });

      expect(mockDatabaseService.client.adherenceLog.create).toHaveBeenCalledWith({
        data: {
          prescriptionId: mockPrescriptionItem.prescriptionId,
          prescriptionItemId: confirmData.prescriptionItemId,
          patientId: patientId,
          takenAt: expect.any(Date),
          status: AdherenceStatus.TAKEN,
          amount: confirmData.amount,
          notes: confirmData.notes,
        },
        include: {
          prescriptionItem: {
            include: {
              medication: true,
            },
          },
        },
      });

      expect(result).toEqual(mockAdherenceLog);
    });

    it('should throw error when prescription item not found', async () => {
      const patientId = 'patient-123';
      const confirmData = {
        prescriptionItemId: 'item-123',
        amount: '1 viên',
      };

      mockDatabaseService.client.prescriptionItem.findFirst.mockResolvedValue(null);

      await expect(service.quickConfirmMedication(patientId, confirmData)).rejects.toThrow(
        'Không tìm thấy thuốc hoặc đơn thuốc không còn hiệu lực'
      );
    });
  });

  describe('getMedicationSchedule', () => {
    it('should return medication schedule for patient', async () => {
      const patientId = 'patient-123';
      const query = { date: '2024-01-15' };

      const mockPrescriptionItems = [
        {
          id: 'item-123',
          dosage: '1 viên',
          timesOfDay: ['08:00', '20:00'],
          instructions: 'Uống sau ăn',
          medication: {
            id: 'med-123',
            name: 'Paracetamol',
          },
          prescription: {
            id: 'prescription-123',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            notes: 'Đơn thuốc test',
          },
          logs: [],
        },
      ];

      mockDatabaseService.client.prescriptionItem.findMany.mockResolvedValue(mockPrescriptionItems);

      const result = await service.getMedicationSchedule(patientId, query);

      expect(result).toHaveProperty('date', '2024-01-15');
      expect(result).toHaveProperty('schedule');
      expect(result).toHaveProperty('summary');
      expect(result.schedule).toHaveLength(2); // 2 thời điểm uống thuốc
      expect(result.summary.total).toBe(2);
    });
  });

  describe('getAdherenceReport', () => {
    it('should return adherence report', async () => {
      const query = {
        patientId: 'patient-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day' as const,
      };

      const mockAdherenceLogs = [
        {
          id: 'log-1',
          takenAt: new Date('2024-01-01T08:00:00Z'),
          status: AdherenceStatus.TAKEN,
          prescriptionItem: {
            medication: { name: 'Paracetamol' },
          },
          prescription: {
            id: 'prescription-123',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
          },
        },
        {
          id: 'log-2',
          takenAt: new Date('2024-01-01T20:00:00Z'),
          status: AdherenceStatus.MISSED,
          prescriptionItem: {
            medication: { name: 'Paracetamol' },
          },
          prescription: {
            id: 'prescription-123',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
          },
        },
      ];

      mockDatabaseService.client.adherenceLog.findMany.mockResolvedValue(mockAdherenceLogs);

      const result = await service.getAdherenceReport(query);

      expect(result).toHaveProperty('patientId', 'patient-123');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('logs');
      expect(result).toHaveProperty('trends');
      expect(result.summary.totalDoses).toBe(2);
      expect(result.summary.takenDoses).toBe(1);
      expect(result.summary.missedDoses).toBe(1);
      expect(result.summary.adherenceRate).toBe(50);
    });
  });
});
