import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/features/auth/types';
import { Claim, ClaimDetailsResponse, PaginatedResponse } from './types';

export const claimsApi = {
  createClaim: async (formData: FormData): Promise<ClaimDetailsResponse> => {
    const response = await apiClient.post<ApiResponse<ClaimDetailsResponse>>('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getMyClaims: async (params?: { page?: number; limit?: number; search?: string; searchField?: string; status?: string }): Promise<PaginatedResponse<Claim>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Claim>>>('/claims/mine', { params });
    return response.data.data;
  },

  getMyStats: async (): Promise<{ totalCount: number; pendingCount: number; approvedCount: number; totalApprovedPayout: number }> => {
    const response = await apiClient.get<ApiResponse<any>>('/claims/mine/stats');
    return response.data.data;
  },

  getClaimById: async (id: string): Promise<ClaimDetailsResponse> => {
    const response = await apiClient.get<ApiResponse<ClaimDetailsResponse>>(`/claims/${id}`);
    return response.data.data;
  },

  resubmitClaim: async (claimId: string, formData: FormData): Promise<ClaimDetailsResponse> => {
    const response = await apiClient.patch<ApiResponse<ClaimDetailsResponse>>(`/reviewer/claims/${claimId}/resubmit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
