import { axiosInstance } from "../axios";
import { AxiosError } from "axios";
import type {
  HealthOverviewResponse,
  HeartRateResponse,
  HealthOverviewParams,
  SleepResponse,
  SpO2Response,
  SummaryOverviewResponse,
} from "@/types/health.d";

export const healthApi = {
  getOverview: async (
    params: HealthOverviewParams
  ): Promise<HealthOverviewResponse> => {
    try {
      const response = await axiosInstance.get<HealthOverviewResponse>(
        "/health/overview",
        { params }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải dữ liệu sức khỏe"
        );
      }
      throw error;
    }
  },
  getSummaryOverview: async (
    patientId: string,
    params: { date: string; period: "day" | "week" | "month" }
  ): Promise<SummaryOverviewResponse> => {
    try {
      const response = await axiosInstance.get<SummaryOverviewResponse>(
        `/health/get-summary-overview/${patientId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải tổng quan sức khỏe"
        );
      }
      throw error;
    }
  },
  getHeartRate: async (
    params: HealthOverviewParams
  ): Promise<HeartRateResponse> => {
    try {
      const response = await axiosInstance.get<HeartRateResponse>(
        "/health/heartrate",
        { params }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải dữ liệu nhịp tim"
        );
      }
      throw error;
    }
  },
  getSleep: async (params: HealthOverviewParams): Promise<SleepResponse> => {
    try {
      const response = await axiosInstance.get<SleepResponse>("/health/sleep", {
        params,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải dữ liệu giấc ngủ"
        );
      }
      throw error;
    }
  },
  getSpO2: async (params: HealthOverviewParams): Promise<SpO2Response> => {
    try {
      const response = await axiosInstance.get<SpO2Response>("/health/spo2", {
        params,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải dữ liệu SpO2"
        );
      }
      throw error;
    }
  },
};
