/**
 * Utility functions for medication time validation
 */

export interface TimeSlot {
  start: number; // Hour (0-23)
  end: number;   // Hour (0-23)
  label: string;  // Display name
}

export const VIETNAMESE_TIME_SLOTS: Record<string, TimeSlot> = {
  'Sáng': { start: 6, end: 10, label: 'Sáng (6:00 - 10:00)' },
  'Trưa': { start: 11, end: 14, label: 'Trưa (11:00 - 14:00)' },
  'Chiều': { start: 14, end: 17, label: 'Chiều (14:00 - 17:00)' },
  'Tối': { start: 18, end: 23, label: 'Tối (18:00 - 23:00)' },
  'Đêm': { start: 22, end: 6, label: 'Đêm (22:00 - 6:00)' }, // Overnight
};

/**
 * Check if current time is within the specified time slot
 */
export function isWithinTimeSlot(timeSlot: string, currentTime?: Date): boolean {
  console.log('=== TIME SLOT CHECK ===');
  console.log('Time slot:', timeSlot);
  
  const timeSlotConfig = VIETNAMESE_TIME_SLOTS[timeSlot];
  console.log('Time slot config:', timeSlotConfig);
  
  if (!timeSlotConfig) {
    console.log('Time slot not found, allowing it');
    return true; // If time slot not found, allow it
  }

  const now = currentTime || new Date();
  const currentHour = now.getHours();
  console.log('Current hour:', currentHour);
  console.log('Time slot range:', timeSlotConfig.start, '-', timeSlotConfig.end);

  // Handle overnight time slot (22:00 - 6:00)
  if (timeSlotConfig.start > timeSlotConfig.end) {
    const result = currentHour >= timeSlotConfig.start || currentHour < timeSlotConfig.end;
    console.log('Overnight slot result:', result);
    return result;
  }

  // Normal time slot
  const result = currentHour >= timeSlotConfig.start && currentHour < timeSlotConfig.end;
  console.log('Normal slot result:', result);
  return result;
}

/**
 * Get time slot configuration for a Vietnamese time string
 */
export function getTimeSlotConfig(timeSlot: string): TimeSlot | null {
  return VIETNAMESE_TIME_SLOTS[timeSlot] || null;
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(timeSlot: string): string {
  const config = getTimeSlotConfig(timeSlot);
  return config ? config.label : timeSlot;
}

/**
 * Get current time in Vietnamese format
 */
export function getCurrentTimeInVietnamese(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 6 && hour < 10) return 'Sáng';
  if (hour >= 11 && hour < 14) return 'Trưa';
  if (hour >= 14 && hour < 17) return 'Chiều';
  if (hour >= 18 && hour < 23) return 'Tối';
  if (hour >= 22 || hour < 6) return 'Đêm';
  
  // Fallback for edge cases
  return 'Ngoài giờ';
}
