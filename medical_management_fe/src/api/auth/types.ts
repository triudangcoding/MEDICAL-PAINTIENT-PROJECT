export interface SignUpData {
  fullName: string;
  phoneNumber: string;
  password: string;
}

export interface SignInData {
  phoneNumber: string;
  password: string;
}

export interface UserInfo {
  id: string;
  userId: string;
  fullName: string;
  gender: "NAM" | "NU";
  birthYear: number;
  livingArea: "THANH_THI" | "NONG_THON";
  specificAddress: string;
  educationLevel: string;
  maritalStatus: string;
  occupation: string;
  occupationOther: string;
  isWorking: "CO" | "KHONG";
  hasInsurance: "CO" | "KHONG";
  insuranceCoverage: string;
  hasChronicDisease: "CO" | "KHONG";
  cancerType: string;
  diagnosisMonthsAgo: number;
  cancerStage: string;
  pastTreatmentMethod: string;
  pastTreatmentOther: string;
  currentTreatmentMethod: string;
  currentTreatmentOther: string;
  hospitalInfo: string;
  height: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userInfo: UserInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Order: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionSubmitHistories: any[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  statusCode?: number;
}

export interface UserResponse {
  data: User;
  statusCode: number;
}
