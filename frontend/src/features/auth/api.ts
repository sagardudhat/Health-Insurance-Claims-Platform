import { apiClient } from '@/lib/axios';
import { ApiResponse, AuthResponse, User } from './types';
import { RegisterInput, LoginInput } from '@/validators/auth';

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', input);
    return response.data.data;
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', input);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
