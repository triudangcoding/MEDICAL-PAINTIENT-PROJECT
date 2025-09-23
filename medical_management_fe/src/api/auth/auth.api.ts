// Mocked auth API for FE-only flow
import { AuthResponse, SignInData, SignUpData, UserResponse } from "./types";

export const authApi = {
  signUp: async (_data: SignUpData): Promise<AuthResponse> => {
    return Promise.resolve({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        fullName: "Mock User",
        phoneNumber: "0123456789",
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        userInfo: [],
        Order: [],
        questionSubmitHistories: [],
      },
      statusCode: 200,
    });
  },

  signIn: async (_data: SignInData): Promise<AuthResponse> => {
    return Promise.resolve({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        fullName: "Mock Admin",
        phoneNumber: "0123456789",
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        userInfo: [],
        Order: [],
        questionSubmitHistories: [],
      },
      statusCode: 200,
    });
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    // return mocked current user
    return Promise.resolve({
      data: {
        id: "mock-user-id",
        fullName: "Mock Admin",
        phoneNumber: "0123456789",
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        userInfo: [],
        Order: [],
        questionSubmitHistories: [],
      },
      statusCode: 200,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("roles");
  },
};
