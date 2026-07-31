import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from './api';
import { ClaimStatus } from '@/components/shared/StatusBadge';

export const useReviewerQueue = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
}) => {
  return useQuery({
    queryKey: ['reviewerQueue', params],
    queryFn: () => reviewApi.getQueue(params),
  });
};

export const useReviewerStats = () => {
  return useQuery({
    queryKey: ['reviewerStats'],
    queryFn: () => reviewApi.getStats(),
  });
};

export const useReviewerAllClaims = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  status?: string;
  flaggedOnly?: string;
}) => {
  return useQuery({
    queryKey: ['reviewerAllClaims', params],
    queryFn: () => reviewApi.getAllClaims(params),
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      claimId: string;
      toStatus: ClaimStatus;
      note?: string;
      deniedItemIds?: string[];
    }) => reviewApi.updateStatus(payload),
    onSuccess: (data) => {
      // Refresh all affected tables so UI stays in sync after a decision
      queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerAllClaims'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllClaims'] });
      queryClient.invalidateQueries({ queryKey: ['claimDetails', data.claim._id] });
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
    },
  });
};

export const useResubmitClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, formData }: { claimId: string; formData: FormData }) =>
      reviewApi.resubmitClaim(claimId, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claimDetails', data.claim._id] });
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
    },
  });
};
