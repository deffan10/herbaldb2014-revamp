import api from './client';
import type { Article, ArticleAd, ArticlePayload, PaginatedResponse } from '@/types';

interface ArticleListResponse {
  data: Article[];
  total?: number;
  current_page?: number;
  per_page?: number;
}

export const articlesApi = {
  getLatest: async (limit = 3): Promise<Article[]> => {
    const { data } = await api.get<ArticleListResponse>('/articles', { params: { limit } });
    return data.data;
  },

  getPaginated: async (params: { page?: number; per_page?: number; search?: string } = {}): Promise<PaginatedResponse<Article>> => {
    const { data } = await api.get<PaginatedResponse<Article>>('/articles', { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const { data } = await api.get<{ data: Article }>(`/articles/${slug}`);
    return data.data;
  },

  uploadImage: async (file: File): Promise<{ message: string; path: string; url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/articles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  create: async (payload: ArticlePayload): Promise<{ message: string; data: Article }> => {
    const { data } = await api.post('/articles', payload);
    return data;
  },

  update: async (id: number, payload: Partial<ArticlePayload>): Promise<{ message: string; data: Article }> => {
    const { data } = await api.put(`/articles/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/articles/${id}`);
    return data;
  },
};

export const articleAdsApi = {
  getPublic: async (limit = 2): Promise<ArticleAd[]> => {
    const { data } = await api.get<{ data: ArticleAd[] }>('/articles/ads', { params: { limit } });
    return data.data;
  },

  getAdmin: async (): Promise<ArticleAd[]> => {
    const { data } = await api.get<{ data: ArticleAd[] }>('/admin/article-ads');
    return data.data;
  },

  create: async (payload: { title?: string; target_url?: string; is_active?: boolean; sort_order?: number; image: File }): Promise<{ message: string; data: ArticleAd }> => {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.target_url) formData.append('target_url', payload.target_url);
    if (typeof payload.is_active !== 'undefined') formData.append('is_active', String(payload.is_active ? 1 : 0));
    if (typeof payload.sort_order !== 'undefined') formData.append('sort_order', String(payload.sort_order));
    formData.append('image', payload.image);

    const { data } = await api.post('/admin/article-ads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: { title?: string; target_url?: string; is_active?: boolean; sort_order?: number; image?: File }): Promise<{ message: string; data: ArticleAd }> => {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title ?? '');
    if (payload.target_url !== undefined) formData.append('target_url', payload.target_url ?? '');
    if (typeof payload.is_active !== 'undefined') formData.append('is_active', String(payload.is_active ? 1 : 0));
    if (typeof payload.sort_order !== 'undefined') formData.append('sort_order', String(payload.sort_order));
    if (payload.image) formData.append('image', payload.image);

    const { data } = await api.post(`/admin/article-ads/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/article-ads/${id}`);
    return data;
  },
};
