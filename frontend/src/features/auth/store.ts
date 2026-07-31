import { create } from 'zustand';
import { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Cookie Helper Utilities
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }
};

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

const deleteCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookieToken = getCookie('token');
    if (cookieToken) return cookieToken;
    return localStorage.getItem('token');
  }
  return null;
};

const getInitialRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookieRefToken = getCookie('refreshToken');
    if (cookieRefToken) return cookieRefToken;
    return localStorage.getItem('refreshToken');
  }
  return null;
};

const getInitialUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const cookieUserStr = getCookie('user_data');
    if (cookieUserStr) {
      try {
        return JSON.parse(cookieUserStr);
      } catch (e) {}
    }
    const localUserStr = localStorage.getItem('user');
    if (localUserStr) {
      try {
        return JSON.parse(localUserStr);
      } catch (e) {}
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  refreshToken: getInitialRefreshToken(),
  setAuth: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      const userJson = JSON.stringify(user);
      // Persist in Cookies (7 days expiry)
      setCookie('token', token, 7);
      if (refreshToken) setCookie('refreshToken', refreshToken, 7);
      setCookie('user_data', userJson, 7);
      setCookie('user_role', user.role, 7);

      // Backup persist in localStorage
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', userJson);
    }
    set({ user, token, refreshToken: refreshToken || null });
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        const userJson = JSON.stringify(user);
        setCookie('user_data', userJson, 7);
        setCookie('user_role', user.role, 7);
        localStorage.setItem('user', userJson);
      } else {
        deleteCookie('user_data');
        deleteCookie('user_role');
        localStorage.removeItem('user');
      }
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      // Clear all auth cookies
      deleteCookie('token');
      deleteCookie('refreshToken');
      deleteCookie('user_data');
      deleteCookie('user_role');

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, refreshToken: null });
  },
}));
