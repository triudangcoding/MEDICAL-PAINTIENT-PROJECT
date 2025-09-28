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
        const res = await axiosInstance.get('/patient/get-all');
        const payload = res.data?.data ?? res.data;
        const items = Array.isArray(payload)
            ? payload
            : (payload.items ?? payload.data ?? []);
        return { data: items, statusCode: res.data?.statusCode ?? 200 } as unknown as IGetPatientResponse;
    },

    async searchPatients(q: string, page?: number, limit?: number): Promise<IGetPatientResponse> {
        const res = await axiosInstance.get('/patient/search', { params: { q, page, limit } });
        const payload = res.data?.data ?? res.data;
        const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
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
        
        // Transform backend data structure to match frontend expectations
        const transformedItems = items.map((item: any) => ({
            id: item.id,
            fullName: item.fullName,
            phoneNumber: item.phoneNumber,
            status: item.status || 'ACTIVE',
            role: item.role || 'PATIENT',
            createdAt: item.createdAt,
            createdBy: item.createdBy,
            createdByUser: item.createdByUser,
            userInfo: item.profile ? {
                id: item.id,
                gender: item.profile.gender || 'OTHER',
                birthYear: item.profile.birthDate ? new Date(item.profile.birthDate).getFullYear() : null,
                specificAddress: item.profile.address || ''
            } : null,
            profile: item.profile,
            medicalHistory: item.medicalHistory || null
        }));
        
        return {
            data: transformedItems,
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
        const res = await axiosInstance.get(`/patient/${id}/detail`);
        return (res.data?.data ?? res.data);
    },

    async createPatientService(data: ICreatePatientRequest): Promise<ICreatePatientResponse> {
        const res = await axiosInstance.post('/doctor/patients', data);
        return (res.data?.data ?? res.data) as ICreatePatientResponse;
    },

    // Legacy doctor route kept if needed; prefer below /patient/:id
    // async updatePatientDoctor(id: string, data: IUpdatePatientRequest) {
    //     const res = await axiosInstance.put(`/doctor/patients/${id}/profile`, data);
    //     return (res.data?.data ?? res.data);
    // },

    async deletePatient(id: string): Promise<any> {
        const res = await axiosInstance.post(`/patient/${id}/delete`);
        return (res.data?.data ?? res.data);
    },

    async updatePatient(id: string, data: Partial<IUpdatePatientRequest>) {
        const res = await axiosInstance.post(`/patient/${id}`, data);
        return (res.data?.data ?? res.data);
    },

    async deleteMultiplePatients(_ids: string[]): Promise<any> {
        // If needed, can call admin bulk; currently not implemented on BE
        return Promise.resolve({ statusCode: 200 });
    },

    // Patient self-service endpoints (patient.controller.ts)
    async getActivePrescriptions() {
        const res = await axiosInstance.get('/patient/prescriptions');
        return res.data?.data ?? res.data;
    },

    async getPrescriptionDetail(id: string) {
        const res = await axiosInstance.get(`/patient/prescriptions/${id}`);
        return res.data?.data ?? res.data;
    },

    async getHistory(params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
        const res = await axiosInstance.get('/patient/history', { params });
        return res.data?.data ?? res.data;
    },

    async getReminders() {
        const res = await axiosInstance.get('/patient/reminders');
        return res.data?.data ?? res.data;
    },

    async confirmIntake(prescriptionId: string, body: { prescriptionItemId: string; takenAt: string; status: string; notes?: string }) {
        const res = await axiosInstance.post(`/patient/prescriptions/${prescriptionId}/confirm`, body);
        return res.data?.data ?? res.data;
    },

    async getAdherence() {
        const res = await axiosInstance.get('/patient/adherence');
        return res.data?.data ?? res.data;
    },

    async getOverview() {
        const res = await axiosInstance.get('/patient/overview');
        return res.data?.data ?? res.data;
    },

    async getAlerts() {
        const res = await axiosInstance.get('/patient/alerts');
        return res.data?.data ?? res.data;
    },

    // Doctor endpoints for patient history management
    async updatePatientHistory(patientId: string, historyData: {
        conditions?: string[];
        allergies?: string[];
        surgeries?: string[];
        familyHistory?: string;
        lifestyle?: string;
        currentMedications?: string[];
        notes?: string;
        extras?: Record<string, string>;
    }) {
        const res = await axiosInstance.put(`/doctor/patients/${patientId}/history`, historyData);
        return res.data?.data ?? res.data;
    },
};