// Mocked doctor API for FE-only flow
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

  getDoctorList: async (): Promise<DoctorListResponse> => {
    return Promise.resolve({
      data: [
        { id: "d1", fullName: "Dr. A", phoneNumber: "0900000001", majorDoctor: "DINH_DUONG", status: "ACTIVE" } as unknown as User,
        { id: "d2", fullName: "Dr. B", phoneNumber: "0900000002", majorDoctor: "TAM_THAN", status: "ACTIVE" } as unknown as User,
      ],
      statusCode: 200,
    });
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
    return Promise.resolve({ id: "d-new", ...data } as unknown as User);
  },

  updateDoctor: async (_id: string, data: UpdateDoctorData): Promise<User> => {
    return Promise.resolve({ id: _id, ...data } as unknown as User);
  },

  deleteDoctor: async (_id: string): Promise<void> => {
    return Promise.resolve();
  },
};
