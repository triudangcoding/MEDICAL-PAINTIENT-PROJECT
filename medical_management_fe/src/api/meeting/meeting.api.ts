import { axiosInstance } from "../axios";
import {
  MeetingScheduleListResponse,
  MeetingScheduleResponse,
  CreateMeetingScheduleData,
  UpdateMeetingScheduleData,
  CreateMeetingWithoutOrderData,
  MeetingScheduleAvailableForDoctorResponse,
} from "./types";

export const meetingApi = {
  getMeetingSchedules: () =>
    axiosInstance.get<MeetingScheduleListResponse>("/meeting-schedules"),
  
  getMeetingSchedulesAvailableForDoctor: () =>
    axiosInstance.get<MeetingScheduleAvailableForDoctorResponse>("/meeting-schedules/available-for-doctor"),

  getMeetingScheduleById: (id: string) =>
    axiosInstance.get<MeetingScheduleResponse>(`/meeting-schedules/${id}`),

  getMeetingSchedulesByUserId: (userId: string, type: "doctor" | "patient") =>
    axiosInstance.get<MeetingScheduleListResponse>(
      `/meeting-schedules/user/${userId}?type=${type}`
    ),

  createMeetingSchedule: (data: CreateMeetingScheduleData) =>
    axiosInstance.post<MeetingScheduleResponse>("/meeting-schedules", data),

  registerSchedule: (data: { meetingScheduleId: string }) =>
    axiosInstance.post<MeetingScheduleResponse>("/meeting-schedules/register-schedule", data),

  createMeetingWithoutOrder: (data: CreateMeetingWithoutOrderData) =>
    axiosInstance.post<MeetingScheduleResponse>(
      "/meeting-schedules/create-without-order",
      data
    ),

  updateMeetingSchedule: (id: string, data: UpdateMeetingScheduleData) =>
    axiosInstance.patch<MeetingScheduleResponse>(
      `/meeting-schedules/${id}`,
      data
    ),

  deleteMeetingSchedule: (id: string) =>
    axiosInstance.delete<MeetingScheduleResponse>(`/meeting-schedules/${id}`),
};
