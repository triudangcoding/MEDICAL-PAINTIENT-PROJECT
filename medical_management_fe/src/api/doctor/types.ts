export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  majorDoctor?: "DINH_DUONG" | "TAM_THAN";
}

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
  statusCode: number;
}

export interface CreateDoctorData {
  phoneNumber: string;
  fullName: string;
  majorDoctor: "DINH_DUONG" | "TAM_THAN";
  password: string;
  role: UserRole;
}

export interface UpdateDoctorData {
  fullName?: string;
  majorDoctor?: "DINH_DUONG" | "TAM_THAN";
  status?: "ACTIVE" | "INACTIVE";
  role?: UserRole;
  password?: string;
  oldPassword?: string;
}
