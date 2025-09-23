// Mocked user API for FE-only flow
import { axiosInstance } from "../axios";
import {
  User,
  UserListResponse,
  CreateUserData,
  UpdateUserData,
  BulkDeleteUsersData,
  PaginationInfo,
} from "./types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: "PATIENT" | "DOCTOR" | "ADMIN";
}

export const userApi = {
  async getUsers(params: GetUsersParams = {}): Promise<UserListResponse> {
    const { page = 1, limit = 10, sortBy, sortOrder, role } = params;
    const res = await axiosInstance.get("/admin/users", {
      params: { page, limit, sortBy, sortOrder, role },
    });
    const payload = res.data?.data ?? res.data;
    // Backend returns { items, total, page, limit }
    const items = payload.items as User[];
    const total = payload.total as number;
    const currentPage = payload.page as number;
    const perPage = payload.limit as number;
    const totalPages = Math.ceil(total / (perPage || 1));
    const pagination: PaginationInfo = {
      currentPage,
      totalPages,
      total,
      limit: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
    return { data: items, pagination, statusCode: res.data?.statusCode ?? 200 };
  },

  async getUserById(id: string): Promise<User> {
    const res = await axiosInstance.get(`/admin/users/${id}`);
    return (res.data?.data ?? res.data) as User;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const res = await axiosInstance.post("/admin/users", data);
    return (res.data?.data ?? res.data) as User;
  },

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const res = await axiosInstance.patch(`/admin/users/${userId}`, data);
    return (res.data?.data ?? res.data) as User;
  },

  async deleteUser(userId: string): Promise<void> {
    await axiosInstance.delete(`/admin/users/${userId}`);
  },

  async bulkDeleteUsers(_data: BulkDeleteUsersData): Promise<void> {
    // Placeholder for future bulk delete endpoint if available
    return Promise.resolve();
  },

  async getDoctorList(): Promise<UserListResponse> {
    const res = await axiosInstance.get("/admin/users", { params: { role: "DOCTOR", limit: 100 } });
    const payload = res.data?.data ?? res.data;
    const items = payload.items as User[];
    return { data: items, pagination: { currentPage: 1, totalPages: 1, total: items.length, limit: items.length, hasNextPage: false, hasPrevPage: false }, statusCode: 200 } as UserListResponse;
  },
};
