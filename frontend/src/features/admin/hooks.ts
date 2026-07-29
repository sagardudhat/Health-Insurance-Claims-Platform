import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from './api';

export const useAdminDashboardStats = (params?: { range?: string; from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['adminStats', params],
    queryFn: () => adminApi.getDashboardStats(params),
  });
};

export const useAdminUsers = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminApi.getAllUsers(params),
  });
};

export const useUnflagClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId: string) => adminApi.unflagClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllClaims'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useAdminAllClaims = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  procedureCode?: string;
  flaggedOnly?: string;
}) => {
  return useQuery({
    queryKey: ['adminAllClaims', params],
    queryFn: () => adminApi.getAllClaims(params),
  });
};
