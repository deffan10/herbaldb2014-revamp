import api from './client';
import type { Compound, PaginatedResponse, SearchParams, CompoundFormData, CompoundGroup } from '@/types';

export const compoundsApi = {
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Compound>> => {
    const { data } = await api.get<PaginatedResponse<Compound>>('/compounds', { params });
    return data;
  },

  getById: async (id: number | string): Promise<Compound> => {
    const { data } = await api.get<Compound>(`/compounds/${id}`);
    return data;
  },

  getGroups: async (): Promise<CompoundGroup[]> => {
    const { data } = await api.get<CompoundGroup[]>('/compounds/groups');
    return data;
  },

  create: async (compoundData: CompoundFormData): Promise<{ message: string; data: Compound }> => {
    const { data } = await api.post('/compounds', compoundData);
    return data;
  },

  update: async (id: number, compoundData: Partial<CompoundFormData>): Promise<{ message: string; data: Compound }> => {
    const { data } = await api.put(`/compounds/${id}`, compoundData);
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/compounds/${id}`);
    return data;
  },

  submit: async (id: number): Promise<{ message: string; data: Compound }> => {
    const { data } = await api.post(`/compounds/${id}/submit`);
    return data;
  },

  verify: async (id: number, action: 'approve' | 'reject', notes?: string): Promise<{ message: string; data: Compound }> => {
    const { data } = await api.post(`/compounds/${id}/verify`, { action, notes });
    return data;
  },
};

export default compoundsApi;
