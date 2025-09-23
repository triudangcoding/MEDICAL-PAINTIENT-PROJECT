import axios, { AxiosResponse, AxiosError } from 'axios';

// Create axios instance with default configs
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage khi có authentication
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi tập trung (401, 403, 500, etc.)
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Handle unauthorized
        localStorage.removeItem('token');
        // Có thể chuyển hướng đến trang đăng nhập
      }

      if (status === 403) {
        // Handle forbidden
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 