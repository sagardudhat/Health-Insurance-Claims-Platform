import axios from 'axios';
import { useAuthStore } from '@/features/auth/store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cookie Helper for Axios interceptor fallback
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

// Request Interceptor: Attach JWT token from Zustand store or Cookie
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized with Automatic Refresh Token Retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken || getCookie('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
          const { user, token: newToken, refreshToken: newRefreshToken } = res.data.data;

          useAuthStore.getState().setAuth(user, newToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          console.warn('Refresh token expired or invalid, redirecting to login...');
        }
      }

      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
