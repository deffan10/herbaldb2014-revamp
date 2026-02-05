import api from './client';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const { data } = await api.post<AuthResponse>('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<{ user: User }>('/me');
    return data.user;
  },

  updateProfile: async (profileData: Partial<User>): Promise<{ message: string; user: User }> => {
    const { data } = await api.put('/profile', profileData);
    return data;
  },

  changePassword: async (passwords: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> => {
    const { data } = await api.put('/password', passwords);
    return data;
  },
};

export default authApi;
