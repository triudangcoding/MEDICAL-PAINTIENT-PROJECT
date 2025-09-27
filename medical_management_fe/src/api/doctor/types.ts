export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export type MajorDoctor = 
  | "DINH_DUONG" 
  | "TAM_THAN" 
  | "TIM_MACH" 
  | "NOI_TIET" 
  | "NGOAI_KHOA" 
  | "PHU_SAN" 
  | "NHI_KHOA" 
  | "MAT" 
  | "TAI_MUI_HONG" 
  | "DA_LIEU" 
  | "XUONG_KHOP" 
  | "THAN_KINH" 
  | "UNG_BUOU" 
  | "HO_HAP" 
  | "TIEU_HOA" 
  | "THAN_TIET_NIEU";

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  majorDoctor?: MajorDoctor;
}

// Alias for doctor user type
export type DoctorUser = User;

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  email: string;
  avatar?: string;
}

export interface DoctorSchedule {
  id: string;
  userId: string;
  status: "FREE" | "BOOKED";
  startDate: string;
  endDate: string;
  user: User;
}

export interface CreateScheduleData {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateScheduleData {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface DoctorSchedulesResponse {
  data: DoctorSchedule[];
  statusCode: number;
}

export interface SingleDoctorScheduleResponse {
  data: DoctorSchedule;
  statusCode: number;
}

export interface DoctorWithSchedule extends Doctor {
  schedules: DoctorSchedule[];
}

export interface AvailableDoctorsResponse {
  data: DoctorWithSchedule[];
  total: number;
}

export interface DoctorListResponse {
  data: User[];
  total?: number;
  statusCode: number;
}

export interface CreateDoctorData {
  phoneNumber: string;
  fullName: string;
  majorDoctor: MajorDoctor;
  password: string;
}

export interface UpdateDoctorData {
  fullName?: string;
  phoneNumber?: string;
  majorDoctor?: MajorDoctor;
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
}
