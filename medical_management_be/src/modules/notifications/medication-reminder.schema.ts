import { z } from 'zod';

// Schema cho việc gửi nhắc nhở thủ công từ bác sĩ
export const sendReminderSchema = z.object({
  prescriptionId: z.string().uuid('ID đơn thuốc không hợp lệ'),
  message: z.string().min(1, 'Nội dung nhắc nhở không được để trống').max(500, 'Nội dung nhắc nhở quá dài'),
  type: z.enum(['MISSED_DOSE', 'LOW_ADHERENCE', 'OTHER'], {
    errorMap: () => ({ message: 'Loại nhắc nhở không hợp lệ' })
  }),
  scheduledTime: z.string().datetime().optional().describe('Thời gian lên lịch nhắc nhở (ISO string)')
});

export type SendReminderDto = z.infer<typeof sendReminderSchema>;

// Schema cho việc xác nhận uống thuốc nhanh
export const quickConfirmSchema = z.object({
  prescriptionItemId: z.string().uuid('ID chi tiết thuốc không hợp lệ'),
  amount: z.string().min(1, 'Số lượng không được để trống').optional(),
  notes: z.string().max(200, 'Ghi chú quá dài').optional(),
  takenAt: z.string().datetime().optional().describe('Thời gian uống thuốc (ISO string)')
});

export type QuickConfirmDto = z.infer<typeof quickConfirmSchema>;

// Schema cho việc lấy lịch uống thuốc
export const medicationScheduleQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày không hợp lệ (YYYY-MM-DD)').optional(),
  patientId: z.string().uuid('ID bệnh nhân không hợp lệ').optional(),
  includeHistory: z.boolean().optional().default(false)
});

export type MedicationScheduleQueryDto = z.infer<typeof medicationScheduleQuerySchema>;

// Schema cho việc lấy báo cáo tuân thủ
export const adherenceReportQuerySchema = z.object({
  patientId: z.string().uuid('ID bệnh nhân không hợp lệ'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày bắt đầu không hợp lệ'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày kết thúc không hợp lệ'),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

export type AdherenceReportQueryDto = z.infer<typeof adherenceReportQuerySchema>;

// Schema cho việc cập nhật cài đặt nhắc nhở
export const reminderSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  advanceMinutes: z.number().int().min(5).max(60).default(15).describe('Nhắc nhở trước bao nhiêu phút'),
  maxRemindersPerDay: z.number().int().min(1).max(10).default(3).describe('Số lần nhắc nhở tối đa mỗi ngày'),
  quietHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ không hợp lệ (HH:MM)'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ không hợp lệ (HH:MM)')
  }).optional()
});

export type ReminderSettingsDto = z.infer<typeof reminderSettingsSchema>;
