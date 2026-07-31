import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from './api';
import { useRouter } from 'next/navigation';

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => claimsApi.createClaim(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
      router.push(`/provider/claims/${data.claim._id}`);
    },
  });
};

export const useMyClaims = (params?: { page?: number; limit?: number; search?: string; searchField?: string; status?: string }) => {
  return useQuery({
    queryKey: ['myClaims', params],
    queryFn: () => claimsApi.getMyClaims(params),
  });
};

export const useMyStats = () => {
  return useQuery({
    queryKey: ['myStats'],
    queryFn: () => claimsApi.getMyStats(),
  });
};

export const useClaimDetails = (id: string) => {
  return useQuery({
    queryKey: ['claimDetails', id],
    queryFn: () => claimsApi.getClaimById(id),
    enabled: !!id,
  });
};

export const useResubmitClaim = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => claimsApi.resubmitClaim(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claimDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
    },
  });
};
