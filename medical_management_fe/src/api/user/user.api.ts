// Mocked user API for FE-only flow
import {
  User,
  UserListResponse,
  CreateUserData,
  UpdateUserData,
  BulkDeleteUsersData,
} from "./types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const userApi = {
  getUsers: async (params: GetUsersParams = {}): Promise<UserListResponse> => {
    const { page = 1, limit = 10 } = params;
    const total = 10;
    const data = Array.from({ length: Math.min(total, limit) }).map((_, idx) => ({
      id: `u${idx + 1}`,
      fullName: `User ${idx + 1}`,
      phoneNumber: `09000000${(10 + idx).toString().slice(-2)}`,
      role: idx % 3 === 0 ? "ADMIN" : idx % 2 === 0 ? "DOCTOR" : "PATIENT",
      majorDoctor: idx % 2 === 0 ? "DINH_DUONG" : "TAM_THAN",
    }));
    return Promise.resolve({
      data,
      pagination: { total, limit, currentPage: page },
      statusCode: 200,
    } as unknown as UserListResponse);
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    return Promise.resolve({ id: "u-new", ...data } as unknown as User);
  },

  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    return Promise.resolve({ id: userId, ...data } as unknown as User);
  },

  deleteUser: async (_userId: string): Promise<void> => {
    return Promise.resolve();
  },

  bulkDeleteUsers: async (_data: BulkDeleteUsersData): Promise<void> => {
    return Promise.resolve();
  },

  getDoctorList: async (): Promise<UserListResponse> => {
    const data = [
      { id: "d1", fullName: "Dr. A", phoneNumber: "0900000001", role: "DOCTOR", majorDoctor: "DINH_DUONG" },
      { id: "d2", fullName: "Dr. B", phoneNumber: "0900000002", role: "DOCTOR", majorDoctor: "TAM_THAN" },
    ];
    return Promise.resolve({ data } as unknown as UserListResponse);
  },
};
