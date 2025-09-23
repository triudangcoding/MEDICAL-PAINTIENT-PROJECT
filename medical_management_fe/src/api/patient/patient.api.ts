// Mocked patient API for FE-only flow
import { axiosInstance } from "../axios";
import { ICreatePatientRequest, ICreatePatientResponse, IGetPatientPaginationResponse, IGetPatientResponse, IUpdatePatientRequest } from "./types.patient";

interface IPaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const patientApi = {
    async getPatients(params?: IPaginationQuery): Promise<IGetPatientPaginationResponse> {
        const { page = 1, limit = 10, search, sortBy, sortOrder } = params || {};
        // Default to admin listing of patients
        const res = await axiosInstance.get('/admin/users', {
            params: { role: 'PATIENT', page, limit, q: search, sortBy, sortOrder }
        });
        const payload = res.data?.data ?? res.data;
        const items = payload.items ?? payload.data ?? [];
        const total = payload.total ?? 0;
        const currentPage = payload.page ?? page;
        const perPage = payload.limit ?? limit;
        return {
            data: items,
            pagination: {
                total,
                limit: perPage,
                currentPage,
                totalPages: Math.ceil((total || 0) / (perPage || 1)),
                hasNextPage: currentPage < Math.ceil((total || 0) / (perPage || 1)),
                hasPrevPage: currentPage > 1
            },
            statusCode: res.data?.statusCode ?? 200
        } as unknown as IGetPatientPaginationResponse;
    },

    async getAllPatients(): Promise<IGetPatientResponse> {
        const res = await axiosInstance.get('/admin/users', { params: { role: 'PATIENT', limit: 1000 } });
        const payload = res.data?.data ?? res.data;
        const items = payload.items ?? payload.data ?? [];
        return { data: items, statusCode: res.data?.statusCode ?? 200 } as unknown as IGetPatientResponse;
    },

    async getPatientsForDoctor(params?: IPaginationQuery): Promise<IGetPatientPaginationResponse> {
        const { page = 1, limit = 10, search, sortBy, sortOrder } = params || {};
        const res = await axiosInstance.get('/doctor/patients', {
            params: { q: search, page, limit, sortBy, sortOrder }
        });
        const payload = res.data?.data ?? res.data;
        const items = payload.items ?? payload.data ?? [];
        const total = payload.total ?? 0;
        const currentPage = payload.page ?? page;
        const perPage = payload.limit ?? limit;
        return {
            data: items,
            pagination: {
                total,
                limit: perPage,
                currentPage,
                totalPages: Math.ceil((total || 0) / (perPage || 1)),
                hasNextPage: currentPage < Math.ceil((total || 0) / (perPage || 1)),
                hasPrevPage: currentPage > 1
            },
            statusCode: res.data?.statusCode ?? 200
        } as unknown as IGetPatientPaginationResponse;
    },

    async getPatientDetailForDoctor(id: string) {
        const res = await axiosInstance.get(`/doctor/patients/${id}`);
        return (res.data?.data ?? res.data);
    },

    async createPatientService(data: ICreatePatientRequest): Promise<ICreatePatientResponse> {
        const res = await axiosInstance.post('/doctor/patients', data);
        return (res.data?.data ?? res.data) as ICreatePatientResponse;
    },

    async updatePatient(id: string, data: IUpdatePatientRequest) {
        const res = await axiosInstance.put(`/doctor/patients/${id}/profile`, data);
        return (res.data?.data ?? res.data);
    },

    async deletePatient(id: string): Promise<any> {
        // No explicit delete endpoints found for doctor/admin patients; soft delete could be admin/users/:id
        const res = await axiosInstance.delete(`/admin/users/${id}`);
        return (res.data?.data ?? res.data);
    },

    async deleteMultiplePatients(_ids: string[]): Promise<any> {
        // If needed, can call admin bulk; currently not implemented on BE
        return Promise.resolve({ statusCode: 200 });
    },
};