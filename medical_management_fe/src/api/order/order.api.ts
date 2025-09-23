import { axiosInstance } from "../axios";
import {
  CreateOrderData,
  OrderListResponse,
  OrderResponse,
  UpdateOrderData,
} from "./types";
import { AxiosError } from "axios";

export const orderApi = {
  getOrders: async (): Promise<OrderListResponse> => {
    try {
      const response = await axiosInstance.get<OrderListResponse>("/orders");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải danh sách đơn hàng"
        );
      }
      throw error;
    }
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    try {
      const response = await axiosInstance.get<OrderResponse>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tải thông tin đơn hàng"
        );
      }
      throw error;
    }
  },

  getOrdersByUserId: async (userId: string): Promise<OrderListResponse> => {
    try {
      const response = await axiosInstance.get<OrderListResponse>(
        `/orders/user/${userId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message ||
            "Không thể tải đơn hàng của người dùng"
        );
      }
      throw error;
    }
  },

  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
    try {
      const response = await axiosInstance.post<OrderResponse>("/orders", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể tạo đơn hàng"
        );
      }
      throw error;
    }
  },

  updateOrder: async (
    id: string,
    data: UpdateOrderData
  ): Promise<OrderResponse> => {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
        `/orders/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể cập nhật đơn hàng"
        );
      }
      throw error;
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/orders/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.message || "Không thể xóa đơn hàng"
        );
      }
      throw error;
    }
  },
};
