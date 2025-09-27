import { axiosInstance } from "@/api/axios";

export interface UserProfile {
  gender?: string;
  birthDate?: string;
  address?: string;
}

export interface CurrentUserResponse {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  profile?: UserProfile;
}

export const UsersApi = {
  getMe: async () => {
    const res = await axiosInstance.get<CurrentUserResponse>("/users/me");
    return res.data;
  },
};


