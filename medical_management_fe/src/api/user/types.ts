export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  majorDoctor?: "DINH_DUONG" | "TAM_THAN";
  userInfo?: UserInfo;
}

export interface UserInfo {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  phoneNumber: string;
  fullName: string;
  password: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  majorDoctor?: "DINH_DUONG" | "TAM_THAN";
}

export interface UpdateUserData {
  phoneNumber?: string;
  fullName?: string;
  password?: string;
  oldPassword?: string;
  role?: "PATIENT" | "DOCTOR" | "ADMIN";
  majorDoctor?: "DINH_DUONG" | "TAM_THAN";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserListResponse {
  data: User[];
  pagination: PaginationInfo;
  statusCode: number;
}

export interface BulkDeleteUsersData {
  ids: string[];
}
