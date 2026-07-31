export type UserRole = 'provider' | 'reviewer' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
