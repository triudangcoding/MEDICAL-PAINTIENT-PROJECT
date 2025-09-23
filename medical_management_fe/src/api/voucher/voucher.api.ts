import { axiosInstance } from "../axios";
import {
  CreateVoucherData,
  UpdateVoucherData,
  VoucherListResponse,
  VoucherResponse,
} from "./types";
import { AxiosError } from "axios";

export const voucherApi = {
  getVouchers: async (): Promise<VoucherListResponse> => {
    try {
      const response = await axiosInstance.get<VoucherListResponse>(
        "/vouchers"
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải danh sách voucher"
        );
      }
      throw error;
    }
  },

  getVoucherById: async (id: string): Promise<VoucherResponse> => {
    try {
      const response = await axiosInstance.get<VoucherResponse>(
        `/vouchers/${id}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải thông tin voucher"
        );
      }
      throw error;
    }
  },

  createVoucher: async (data: CreateVoucherData): Promise<VoucherResponse> => {
    try {
      const response = await axiosInstance.post<VoucherResponse>(
        "/vouchers",
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tạo voucher"
        );
      }
      throw error;
    }
  },

  updateVoucher: async (
    id: string,
    data: UpdateVoucherData
  ): Promise<VoucherResponse> => {
    try {
      const response = await axiosInstance.patch<VoucherResponse>(
        `/vouchers/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể cập nhật voucher"
        );
      }
      throw error;
    }
  },

  deleteVoucher: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/vouchers/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể xóa voucher"
        );
      }
      throw error;
    }
  },
};
