import { axiosInstance } from "@/api/axios";

export interface MedicationDto {
  name: string;
  strength?: string;
  form?: string;
  unit?: string;
  description?: string;
  isActive?: boolean;
}

export interface MedicationEntity extends MedicationDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export const MedicationsApi = {
  list: async (params: PaginationQuery = {}) => {
    const res = await axiosInstance.get("/admin/medications/get-all", {
      params: {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        isActive: params.isActive,
      },
    });
    const payload = res.data?.data ?? res.data;
    return payload;
  },
  create: async (dto: MedicationDto) => {
    const res = await axiosInstance.post("/admin/medications", dto);
    return res.data?.data ?? res.data;
  },
  update: async (id: string, dto: MedicationDto) => {
    const res = await axiosInstance.patch(`/admin/medications/${id}`, dto);
    return res.data?.data ?? res.data;
  },
  deactivate: async (id: string) => {
    const res = await axiosInstance.delete(`/admin/medications/${id}`);
    return res.data?.data ?? res.data;
  },
};


