import { axiosInstance } from "@/api/axios";

// Types matching backend controller contracts
export type SortOrder = "asc" | "desc";

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Patients
export interface PatientProfileDto {
  gender?: string;
  birthDate?: string;
  address?: string;
}

export interface PatientCreateDto {
  fullName: string;
  phoneNumber: string;
  password: string;
  profile?: PatientProfileDto;
}

export interface PatientHistoryDto {
  conditions?: string[];
  allergies?: string[];
  surgeries?: string[];
  familyHistory?: string;
  lifestyle?: string;
  currentMedications?: string[];
  notes?: string;
}

export interface PatientEntity {
  id: string;
  fullName: string;
  phoneNumber: string;
  profile?: PatientProfileDto & { birthDate?: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
}

export const DoctorApi = {
  // Patients
  listPatients: async (params: { q?: string } & PaginationQuery) => {
    const { q, page, limit, sortBy, sortOrder } = params || {};
    const res = await axiosInstance.get<PaginatedResponse<PatientEntity>>(
      "/doctor/patients",
      { params: { q, page, limit, sortBy, sortOrder } }
    );
    return res.data;
  },

  getPatient: async (id: string) => {
    const res = await axiosInstance.get<PatientEntity>(`/doctor/patients/${id}`);
    return res.data;
  },

  createPatient: async (dto: PatientCreateDto) => {
    const res = await axiosInstance.post<PatientEntity>("/doctor/patients", dto);
    return res.data;
  },

  updatePatientProfile: async (id: string, dto: PatientProfileDto) => {
    const res = await axiosInstance.put<PatientEntity>(
      `/doctor/patients/${id}/profile`,
      dto
    );
    return res.data;
  },

  updatePatientHistory: async (id: string, dto: PatientHistoryDto) => {
    const res = await axiosInstance.put<PatientEntity>(
      `/doctor/patients/${id}/history`,
      dto
    );
    return res.data;
  },

  // Prescriptions
  listPrescriptions: async (params: PaginationQuery) => {
    const res = await axiosInstance.get(
      "/doctor/prescriptions",
      { params }
    );
    return res.data;
  },

  getPrescription: async (id: string) => {
    const res = await axiosInstance.get(`/doctor/prescriptions/${id}`);
    return res.data?.data ?? res.data;
  },

  createPrescription: async (dto: {
    patientId: string;
    items: Array<{
      medicationId: string;
      dosage: string;
      frequencyPerDay: number;
      timesOfDay: string[];
      durationDays: number;
      route?: string;
      instructions?: string;
    }>;
    notes?: string;
  }) => {
    const res = await axiosInstance.post("/doctor/prescriptions", dto);
    return res.data;
  },

  updatePrescription: async (
    id: string,
    dto: {
      status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
      startDate?: string;
      endDate?: string;
      items?: Array<{
        medicationId: string;
        dosage: string;
        frequencyPerDay: number;
        timesOfDay: string[];
        durationDays: number;
        route?: string;
        instructions?: string;
      }>;
      notes?: string;
    }
  ) => {
    const res = await axiosInstance.patch(`/doctor/prescriptions/${id}`, dto);
    return res.data;
  },

  cancelPrescription: async (id: string) => {
    // Backend không có DELETE, hủy đơn bằng PATCH status
    const res = await axiosInstance.patch(`/doctor/prescriptions/${id}`, { status: 'CANCELLED' });
    return res.data;
  },

  // Overview & adherence
  overview: async (params?: { doctorId?: string }) => {
    const res = await axiosInstance.get("/doctor/overview", { params });
    return res.data?.data ?? res.data;
  },

  overviewPrescriptionItems: async (params: { doctorId?: string; page?: number; limit?: number }) => {
    const { doctorId, page, limit } = params || {};
    const res = await axiosInstance.get("/doctor/overview/prescription-items", { params: { doctorId, page, limit } });
    return res.data?.data ?? res.data;
  },

  overviewActivePatients: async (params: { doctorId?: string; page?: number; limit?: number }) => {
    const { doctorId, page, limit } = params || {};
    const res = await axiosInstance.get("/doctor/overview/active-patients", { params: { doctorId, page, limit } });
    return res.data?.data ?? res.data;
  },

  adherence: async (patientId: string) => {
    const res = await axiosInstance.get(`/doctor/patients/${patientId}/adherence`);
    return res.data;
  },

  // Alerts
  listAlerts: async () => {
    const res = await axiosInstance.get("/doctor/alerts");
    return res.data;
  },

  resolveAlert: async (id: string) => {
    const res = await axiosInstance.put(`/doctor/alerts/${id}/resolve`, {});
    return res.data;
  },

  // Adherence - Missed doses aggregation and warning action
  listPatientsMissed: async (sinceDays?: number) => {
    const res = await axiosInstance.get(
      "/doctor/adherence/missed",
      { params: { sinceDays } }
    );
    return (res.data?.data ?? res.data) as {
      items: Array<{ patientId: string; fullName: string; phoneNumber: string; missedCount: number }>
      total: number;
      since: string;
    };
  },

  warnPatient: async (patientId: string, message?: string) => {
    const res = await axiosInstance.post(`/doctor/patients/${patientId}/warn`, { message });
    return res.data as { message: string; alertId: string };
  },

  // Adherence - Patients with detailed adherence status and alert types
  listPatientsWithAdherenceAndAlerts: async (sinceDays?: number) => {
    const res = await axiosInstance.get(
      "/doctor/adherence/status",
      { params: { sinceDays } }
    );
    return (res.data?.data ?? res.data) as {
      items: Array<{
        patientId: string;
        fullName: string;
        phoneNumber: string;
        adherence: {
          taken: number;
          missed: number;
          skipped: number;
        };
        todayAdherence: {
          taken: number;
          missed: number;
          skipped: number;
        };
        alerts: {
          missedDose: number;
          lowAdherence: number;
          other: number;
        };
        primaryStatus: 'TAKEN' | 'MISSED' | 'MIXED';
        todayStatus: 'COMPLIANT' | 'PARTIAL' | 'MISSED' | 'NO_DATA';
        todayWarningCount: number;
        totalMissed: number;
        totalTaken: number;
        totalAlerts: number;
      }>;
      total: number;
      since: string;
    };
  },
};
