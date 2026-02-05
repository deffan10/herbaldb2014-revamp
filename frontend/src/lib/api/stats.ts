import api from './client';

export interface Stats {
  species: number;
  compounds: number;
  references: number;
  contributors: number;
  local_names: number;
  virtues: number;
  compound_groups: number;
  plant_parts: number;
}

export interface StatsResponse {
  success: boolean;
  data: Stats;
}

export const statsApi = {
  getStats: async (): Promise<Stats> => {
    const response = await api.get<StatsResponse>('/stats');
    return response.data.data;
  },
};
