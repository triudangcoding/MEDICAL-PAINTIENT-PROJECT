import { User } from "../doctor/types";
import { ProductService } from "../product/types";

export interface DoctorScheduleFree {
  id: string;
  userId: string;
  status: "FREE" | "BUSY";
  startDate: string;
  endDate: string;
  user: User;
}

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  lastPrice: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  productServiceId: string;
  voucherId: string;
  scheduleId: string;
  user: User;
  productServices: ProductService;
}

export interface MeetingSchedule {
  id: string;
  orderId: string;
  doctorScheduleFreeId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  meetingUrl?: string;
  order?: {
    id: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
    productServices: {
      id: string;
      name: string;
      description: string;
    };
  };
  doctorScheduleFree?: {
    id: string;
    startDate: string;
    endDate: string;
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  patient?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  doctor?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
}

export interface CreateMeetingScheduleData {
  orderId: string;
  doctorScheduleFreeId: string;
  startDate: string;
  endDate: string;
}

export interface CreateMeetingWithoutOrderData {
  startDate: string;
  endDate: string;
  doctorId: string;
  patientId: string;
}

export interface UpdateMeetingScheduleData {
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
}

export interface RegisterScheduleData {
  meetingScheduleId: string;
}

export interface MeetingScheduleResponse {
  data: MeetingSchedule;
}

export interface MeetingScheduleListResponse {
  data: MeetingSchedule[];
}

export interface MeetingScheduleAvailableForDoctor {
  id: string;
  orderId: string | null;
  startDate: string;
  endDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  meetingUrl: string | null;
  doctorScheduleFreeId: string | null;
  order: {
    id: string;
    userId: string;
    totalPrice: number;
    lastPrice: number;
    status: "PENDING" | "PAID" | "CANCELLED";
    productServiceId: string;
    voucherId: string;
    scheduleId: string | null;
    user: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: "PATIENT" | "DOCTOR" | "ADMIN";
      status: "ACTIVE" | "INACTIVE";
      majorDoctor: string;
    };
    productServices: {
      id: string;
      name: string;
      description: string;
      price: number;
      key: string;
      voucherId: string | null;
      orderId: string | null;
    };
  } | null;
  doctorScheduleFree: {
    id: string;
    userId: string;
    status: "FREE" | "BOOKED";
    startDate: string;
    endDate: string;
    user: {
      id: string;
      phoneNumber: string;
      fullName: string;
      role: "PATIENT" | "DOCTOR" | "ADMIN";
      status: "ACTIVE" | "INACTIVE";
      majorDoctor: string | null;
    };
  } | null;
  patient: {
    id: string;
    phoneNumber: string;
    fullName: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    status: "ACTIVE" | "INACTIVE";
    majorDoctor: string | null;
  } | null;
}

export interface MeetingScheduleAvailableForDoctorResponse {
  data: MeetingScheduleAvailableForDoctor[];
  statusCode: number;
}
