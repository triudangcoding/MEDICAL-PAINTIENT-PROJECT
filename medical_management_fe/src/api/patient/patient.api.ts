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
        const { page = 1, limit = 10 } = params || {};
        // Use public endpoint to get all patients with pagination
        const res = await axiosInstance.get('/patient/get-all', {
            params: { page, limit }
        });
        const payload = res.data;
        const items = payload.data ?? [];
        const total = payload.pagination?.total ?? 0;
        const currentPage = payload.pagination?.page ?? page;
        const perPage = payload.pagination?.limit ?? limit;
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
            statusCode: res.status || 200
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

    async searchPatients(q: string, page?: number, limit?: number): Promise<IGetPatientPaginationResponse> {
        const res = await axiosInstance.get('/patient/search', { params: { q, page, limit } });
        const payload = res.data;
        const items = payload.data ?? [];
        const total = payload.pagination?.total ?? 0;
        const currentPage = payload.pagination?.page ?? page ?? 1;
        const perPage = payload.pagination?.limit ?? limit ?? 10;
        
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

    async getPatientsForDoctor(params?: IPaginationQuery): Promise<IGetPatientPaginationResponse> {
        const { page = 1, limit = 10, search } = params || {};
        
        // Sử dụng API active patients để chỉ lấy bệnh nhân đang điều trị
        const res = await axiosInstance.get('/doctor/overview/active-patients', {
            params: { page, limit }
        });
        const payload = res.data?.data || res.data;
        const items = payload?.items ?? [];
        const currentPage = payload?.page ?? page;
        const perPage = payload?.limit ?? limit;
        
        // Transform backend data structure to match frontend expectations
        const transformedItems = items.map((item: any) => ({
            id: item.patientId,
            fullName: item.patientName,
            phoneNumber: item.phoneNumber,
            status: 'ACTIVE', // Active patients are always ACTIVE
            role: 'PATIENT',
            createdAt: new Date().toISOString(), // Default value
            createdBy: item.doctorId,
            createdByUser: {
                id: item.doctorId,
                fullName: item.doctorName,
                role: 'DOCTOR'
            },
            userInfo: null, // Will be populated when needed
            profile: null, // Will be populated when needed
            medicalHistory: null, // Will be populated when needed
            adherence: item.adherence // Include adherence data
        }));
        
        // Filter by search if provided
        const filteredItems = search 
            ? transformedItems.filter((item: any) => 
                item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                item.phoneNumber?.includes(search)
              )
            : transformedItems;
        
        return {
            data: filteredItems,
            pagination: {
                total: filteredItems.length,
                limit: perPage,
                currentPage,
                totalPages: Math.ceil((filteredItems.length || 0) / (perPage || 1)),
                hasNextPage: currentPage < Math.ceil((filteredItems.length || 0) / (perPage || 1)),
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

    async getReminders(date?: string) {
        const params = date ? { date } : {};
        const res = await axiosInstance.get('/patient/reminders', { params });
        return res.data?.data ?? res.data;
    },

    async confirmIntake(prescriptionId: string, body: { prescriptionItemId: string; takenAt: string; status: string; notes?: string }) {
        const res = await axiosInstance.post(`/patient/prescriptions/${prescriptionId}/confirm-taken`, body);
        return res.data?.data ?? res.data;
    },

    async markMissed(prescriptionId: string, body: { prescriptionItemId?: string; notes?: string }) {
        const res = await axiosInstance.post(`/patient/prescriptions/${prescriptionId}/mark-missed`, body);
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

    async resolveAlert(alertId: string) {
        const res = await axiosInstance.put(`/notifications/${alertId}/resolve`);
        return res.data?.data ?? res.data;
    },

    // Enhanced medication reminder APIs
    async quickConfirmMedication(data: {
        prescriptionItemId: string;
        amount?: string;
        notes?: string;
        takenAt?: string;
    }) {
        const res = await axiosInstance.post('/notifications/patient/quick-confirm', data);
        return res.data?.data ?? res.data;
    },

    async getMedicationSchedule(date?: string) {
        const params = date ? { date } : {};
        const res = await axiosInstance.get('/notifications/patient/medication-schedule', { params });
        return res.data?.data ?? res.data;
    },

    async getUpcomingMedications() {
        const res = await axiosInstance.get('/notifications/patient/upcoming-medications');
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