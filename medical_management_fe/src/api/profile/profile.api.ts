import { axiosInstance } from "../axios";

export interface DoctorFields {
  id: string;
  phoneNumber: string;
  password: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  majorDoctorId: string;
  profile: any | null;
  majorDoctor: {
    id: string;
    code: string;
    name: string;
    nameEn: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  };
  prescriptionsAsDoctor: any[];
  alertsAsDoctor: any[];
  createdPatients: any[];
  stats: {
    totalPatientsCreated: number;
    totalPrescriptions: number;
    totalAlerts: number;
  };
}

export interface PatientFields {
  id: string;
  phoneNumber: string;
  password: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  majorDoctorId: string | null;
  profile: {
    id: string;
    userId: string;
    gender: string;
    birthDate: string | null;
    address: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  medicalHistory: {
    id: string;
    patientId: string;
    conditions: string[];
    allergies: string[];
    surgeries: string[];
    familyHistory: string;
    lifestyle: string;
    currentMedications: string[];
    notes: string;
    extras: any;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdByUser: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    majorDoctor: {
      id: string;
      code: string;
      name: string;
      nameEn: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
    };
  } | null;
  prescriptionsAsPatient: any[];
  adherenceLogs: any[];
  alertsAsPatient: any[];
  stats: {
    totalPrescriptions: number;
    activePrescriptions: number;
    totalAdherenceLogs: number;
    takenLogs: number;
    missedLogs: number;
    adherenceRate: number;
    totalAlerts: number;
    unresolvedAlerts: number;
  };
}

export interface UpdateDoctorFieldsData {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
  major?: string;
}

export interface UpdatePatientFieldsData {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export const profileApi = {
  // Doctor APIs
  getDoctorFields: async (): Promise<DoctorFields> => {
    const res = await axiosInstance.get('/doctor/fields');
    return res.data;
  },

  updateDoctorFields: async (data: UpdateDoctorFieldsData): Promise<DoctorFields> => {
    const res = await axiosInstance.put('/doctor/fields', data);
    return res.data;
  },

  // Patient APIs
  getPatientFields: async (): Promise<PatientFields> => {
    const res = await axiosInstance.get('/patient/fields');
    return res.data;
  },

  updatePatientFields: async (data: UpdatePatientFieldsData): Promise<PatientFields> => {
    const res = await axiosInstance.put('/patient/fields', data);
    return res.data;
  },
};

