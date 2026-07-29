import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from './api';
import { ClaimStatus } from '@/components/shared/StatusBadge';

export const useReviewerQueue = (params?: { page?: number; limit?: number; search?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerStats'] });
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
