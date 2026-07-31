import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from './api';
import { useAuthStore } from './store';
import { LoginInput, RegisterInput } from '@/validators/auth';
import { useRouter } from 'next/navigation';
import { ROLE_DASHBOARDS, UserRole } from '@/config/constants';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);

      const targetPath = ROLE_DASHBOARDS[data.user.role as UserRole] || '/provider/dashboard';
      router.push(targetPath);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);

      const targetPath = ROLE_DASHBOARDS[data.user.role as UserRole] || '/provider/dashboard';
      router.push(targetPath);
    },
  });
};

export const useCurrentUser = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      const user = await authApi.getMe();
      setUser(user);
      return user;
    },
    enabled: !!token,
  });
};
