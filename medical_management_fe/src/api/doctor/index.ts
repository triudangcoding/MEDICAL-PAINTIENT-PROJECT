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
    return res.data;
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
      items?: Array<{
        id?: string;
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
    const res = await axiosInstance.put(`/doctor/prescriptions/${id}`, dto);
    return res.data;
  },

  cancelPrescription: async (id: string) => {
    const res = await axiosInstance.delete(`/doctor/prescriptions/${id}`);
    return res.data;
  },

  // Overview & adherence
  overview: async () => {
    const res = await axiosInstance.get("/doctor/overview");
    return res.data;
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
};

export type { PatientCreateDto, PatientHistoryDto, PatientProfileDto };


