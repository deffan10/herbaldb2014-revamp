import api from './client';
import type { Species, PaginatedResponse, SearchParams, SpeciesFormData } from '@/types';

export const speciesApi = {
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Species>> => {
    const { data } = await api.get<PaginatedResponse<Species>>('/species', { params });
    return data;
  },

  getById: async (id: number | string): Promise<Species> => {
    const { data } = await api.get<Species>(`/species/${id}`);
    return data;
  },

  getFamilies: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/species/families');
    return data;
  },

  create: async (speciesData: SpeciesFormData): Promise<{ message: string; data: Species }> => {
    const { data } = await api.post('/species', speciesData);
    return data;
  },

  update: async (id: number, speciesData: Partial<SpeciesFormData>): Promise<{ message: string; data: Species }> => {
    const { data } = await api.put(`/species/${id}`, speciesData);
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/species/${id}`);
    return data;
  },

  submit: async (id: number): Promise<{ message: string; data: Species }> => {
    const { data } = await api.post(`/species/${id}/submit`);
    return data;
  },

  verify: async (id: number, action: 'approve' | 'reject', notes?: string): Promise<{ message: string; data: Species }> => {
    const { data } = await api.post(`/species/${id}/verify`, { action, notes });
    return data;
  },
};

export default speciesApi;
