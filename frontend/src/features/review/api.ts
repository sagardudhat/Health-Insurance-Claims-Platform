import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/features/auth/types';
import { Claim, ClaimDetailsResponse, PaginatedResponse } from '@/features/claims/types';

export interface ReviewerStats {
  pendingQueueCount: number;
  claimsReviewedToday: number;
  avgProcessingTimeHours: number;
}

export const reviewApi = {
  getQueue: async (params?: { page?: number; limit?: number; search?: string; searchField?: string }): Promise<PaginatedResponse<Claim>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Claim>>>('/reviewer/queue', { params });
    return response.data.data;
  },

  getStats: async (): Promise<ReviewerStats> => {
    const response = await apiClient.get<ApiResponse<ReviewerStats>>('/reviewer/stats');
    return response.data.data;
  },

  getAllClaims: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
    status?: string;
    flaggedOnly?: string;
  }): Promise<PaginatedResponse<Claim>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Claim>>>('/reviewer/claims', { params });
    return response.data.data;
  },

  updateStatus: async (payload: {
    claimId: string;
    toStatus: ClaimStatus;
    note?: string;
    deniedItemIds?: string[];
  }): Promise<ClaimDetailsResponse> => {
    const response = await apiClient.patch<ApiResponse<ClaimDetailsResponse>>(
      `/reviewer/claims/${payload.claimId}/status`,
      {
        toStatus: payload.toStatus,
        note: payload.note,
        deniedItemIds: payload.deniedItemIds,
      }
    );
    return response.data.data;
  },

  resubmitClaim: async (claimId: string, formData: FormData): Promise<ClaimDetailsResponse> => {
    const response = await apiClient.patch<ApiResponse<ClaimDetailsResponse>>(
      `/reviewer/claims/${claimId}/resubmit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};
