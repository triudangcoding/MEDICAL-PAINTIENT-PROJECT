import axios from './axios';
import { AxiosResponse } from 'axios';

// Định nghĩa các interface
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Định nghĩa các services

// Ví dụ service cho User
export const UserService = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.get('/users/profile');
  },

  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.put('/users/profile', data);
  },
};

// Ví dụ service cho Authentication
export const AuthService = {
  login: (credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ token: string }>>> => {
    return axios.post('/auth/login', credentials);
  },

  register: (userData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/auth/register', userData);
  },

  logout: (): Promise<AxiosResponse<ApiResponse<null>>> => {
    return axios.post('/auth/logout');
  },
};

// Các service khác có thể được thêm vào đây 