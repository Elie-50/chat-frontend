import { create } from 'zustand'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import type {
  AuthResponse,
  RequestCodePayload,
  VerifyPayload,
  User,
  UpdatePayload,
} from '@/types/auth'

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  email: string | null;
  accessTokenExpiresAt: number | null,

  requestCode: (payload: RequestCodePayload) => Promise<void>;
  verifyCode: (payload: VerifyPayload) => Promise<void>;
  updateUser: (payload: UpdatePayload) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  email: null,
  accessTokenExpiresAt: null,

  requestCode: async ({ email }) => {
    try {
      set({ loading: true, error: null })

      await api.post<void>('/auth/request-code', { email })

      set({ loading: false, email: email })
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>

      set({
        loading: false,
        error: err.response?.data?.message ?? 'Failed to request code',
      })
    }
  },

  verifyCode: async ({ email, code }) => {
    try {
      set({ loading: true, error: null })

      const res = await api.post<AuthResponse>('/auth/verify', {
        email,
        code,
      })

      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
        loading: false,
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000
      })
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>

      set({
        loading: false,
        error: err.response?.data?.message ?? 'Verification failed',
      })
    }
  },

  updateUser: async ({ username }) => {
    try {
      set({ loading: true, error: null })

      const res = await api.patch<{ user: User, accessToken: string}>('/auth/me', { username });
      const data = res.data;
      set({
        user: data.user,
        accessToken: data.accessToken,
        error: null,
        loading: false,
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000
      });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>

      set({
        loading: false,
        error: err.response?.data?.message ?? 'Verification failed',
      })
    }
  },

  refreshToken: async () => {
    try {
      set({ loading: true })
      const res = await api.post<AuthResponse>('/auth/refresh', {});
      
      set({
        accessToken: res.data.accessToken,
        loading: false,
        user: res.data.user,
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000
      });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>

      set({
        loading: false,
        error: err.response?.data?.message ?? 'Verification failed',
      })
    }
  },

  logout: async () => {
    await api.post<void>('/auth/logout', {});
    set({
      user: null,
      accessToken: null,
    })
  },
}))
