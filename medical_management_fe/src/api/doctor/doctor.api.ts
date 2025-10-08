// Real doctor API calls to backend
import { axiosInstance } from "../axios";
import {
  AvailableDoctorsResponse,
  DoctorSchedule,
  CreateScheduleData,
  DoctorSchedulesResponse,
  SingleDoctorScheduleResponse,
  UpdateScheduleData,
  DoctorListResponse,
  CreateDoctorData,
  UpdateDoctorData,
  User,
} from "./types";

export const doctorApi = {
  getAvailableDoctors: async (_date: string): Promise<AvailableDoctorsResponse> => {
    return Promise.resolve({
      data: [],
      total: 0,
    });
  },

  getDoctorList: async (params?: {
    q?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<DoctorListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const res = await axiosInstance.get(`/doctor/doctor?${queryParams.toString()}`);
    const payload = res.data;
    const items = payload.data || payload.items || [];
    const total = payload.total || 0;
    const currentPage = payload.page || params?.page || 1;
    const perPage = payload.limit || params?.limit || 10;
    
    return {
      data: items,
      total,
      pagination: {
        total,
        limit: perPage,
        currentPage,
        totalPages: Math.ceil((total || 0) / (perPage || 1)),
        hasNextPage: currentPage < Math.ceil((total || 0) / (perPage || 1)),
        hasPrevPage: currentPage > 1
      },
      statusCode: res.status || 200,
    };
  },

  getPatientList: async (): Promise<DoctorListResponse> => {
    return Promise.resolve({ data: [], statusCode: 200 });
  },

  getDoctorSchedules: async (): Promise<DoctorSchedulesResponse> => {
    return Promise.resolve({
      data: [
        {
          id: "s1",
          userId: "d1",
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
          user: { id: "d1", fullName: "Dr. A" } as any,
        } as unknown as DoctorSchedule,
      ],
      statusCode: 200,
    });
  },

  getScheduleById: async (_id: string): Promise<SingleDoctorScheduleResponse> => {
    return Promise.resolve({
      data: {
        id: "s1",
        userId: "d1",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        user: { id: "d1", fullName: "Dr. A" } as any,
      } as unknown as DoctorSchedule,
      statusCode: 200,
    });
  },

  getSchedulesByUserId: async (_userId: string): Promise<DoctorSchedulesResponse> => {
    return Promise.resolve({ data: [], statusCode: 200 });
  },

  createSchedule: async (_data: CreateScheduleData): Promise<SingleDoctorScheduleResponse> => {
    return Promise.resolve({
      data: {
        id: "s-new",
        userId: "d1",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        user: { id: "d1", fullName: "Dr. A" } as any,
      } as unknown as DoctorSchedule,
      statusCode: 201,
    });
  },

  updateSchedule: async (_id: string, _data: UpdateScheduleData): Promise<SingleDoctorScheduleResponse> => {
    return Promise.resolve({
      data: {
        id: "s1",
        userId: "d1",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        user: { id: "d1", fullName: "Dr. A" } as any,
      } as unknown as DoctorSchedule,
      statusCode: 200,
    });
  },

  deleteSchedule: async (_id: string): Promise<void> => {
    return Promise.resolve();
  },

  updateDoctorSchedule: async (_doctorId: string, _scheduleId: string, data: Partial<DoctorSchedule>): Promise<DoctorSchedule> => {
    return Promise.resolve({ ...(data as any) });
  },

  createDoctor: async (data: CreateDoctorData): Promise<User> => {
    const res = await axiosInstance.post('/doctor/doctor', data);
    return res.data.data || res.data;
  },

  updateDoctor: async (id: string, data: UpdateDoctorData): Promise<User> => {
    const res = await axiosInstance.put(`/doctor/doctor/${id}`, data);
    return res.data.data || res.data;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/doctor/doctor/${id}`);
  },

  getDoctor: async (id: string): Promise<User> => {
    const res = await axiosInstance.get(`/doctor/doctor/${id}`);
    return res.data.data || res.data;
  },

  // Enhanced medication reminder APIs for doctors
  sendManualReminder: async (data: {
    prescriptionId: string;
    message: string;
    type: 'MISSED_DOSE' | 'LOW_ADHERENCE' | 'OTHER';
    scheduledTime?: string;
  }) => {
    const res = await axiosInstance.post('/notifications/doctor/send-reminder', data);
    return res.data?.data ?? res.data;
  },

  getAdherenceReport: async (params: {
    patientId: string;
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    const res = await axiosInstance.get('/notifications/doctor/adherence-report', { params });
    return res.data?.data ?? res.data;
  },

  getPatientMedicationSchedule: async (patientId: string, date?: string) => {
    const params = date ? { date, patientId } : { patientId };
    const res = await axiosInstance.get('/notifications/patient/medication-schedule', { params });
    return res.data?.data ?? res.data;
  },

  getPatientPrescriptions: async (patientId: string) => {
    const res = await axiosInstance.get(`/doctor/prescriptions/patient/${patientId}`);
    return res.data;
  },
};
