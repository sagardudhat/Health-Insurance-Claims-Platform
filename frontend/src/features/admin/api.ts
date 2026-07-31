import { apiClient } from '@/lib/axios';
import { ApiResponse, User } from '@/features/auth/types';
import { Claim, PaginatedResponse } from '@/features/claims/types';

export interface AdminDashboardStats {
  range: string;
  totalClaimsSubmitted: number;
  grandTotalClaimed: number;
  grandTotalPayout: number;
  avgProcessingTimeHours: number;
  flaggedClaimsCount: number;
  statusCounts: Record<string, number>;
  statusBreakdownList: Array<{ status: string; count: number }>;
}

export interface PolicyConfig {
  year: number;
  annualLimit: number;
  deductible: number;
  coverageRate: number;
  isActive: boolean;
}

export const adminApi = {
  getDashboardStats: async (params?: {
    range?: string;
    from?: string;
    to?: string;
  }): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard', {
      params,
    });
    return response.data.data;
  },

  recomputeFraudFlag: async (claimId: string): Promise<Claim> => {
    const response = await apiClient.post<ApiResponse<Claim>>(
      `/admin/claims/${claimId}/recompute-flag`
    );
    return response.data.data;
  },

  unflagClaim: async (claimId: string): Promise<Claim> => {
    const response = await apiClient.patch<ApiResponse<Claim>>(`/admin/claims/${claimId}/unflag`);
    return response.data.data;
  },

  getFlaggedClaims: async (): Promise<Claim[]> => {
    const response = await apiClient.get<ApiResponse<Claim[]>>('/admin/claims/flagged');
    return response.data.data;
  },

  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      params,
    });
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended'): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data.data;
  },

  getAllClaims: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
    status?: string;
    procedureCode?: string;
    flaggedOnly?: string;
  }): Promise<PaginatedResponse<Claim>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Claim>>>('/admin/claims', {
      params,
    });
    return response.data.data;
  },

  getPolicyConfig: async (year?: number): Promise<PolicyConfig> => {
    const response = await apiClient.get<ApiResponse<PolicyConfig>>('/admin/config', {
      params: year ? { year } : undefined,
    });
    return response.data.data;
  },

  updatePolicyConfig: async (data: {
    year: number;
    annualLimit: number;
    deductible: number;
    coverageRate: number;
    isActive?: boolean;
  }): Promise<PolicyConfig> => {
    const response = await apiClient.put<ApiResponse<PolicyConfig>>('/admin/config', data);
    return response.data.data;
  },
};
