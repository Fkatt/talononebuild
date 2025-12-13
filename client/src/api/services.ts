// API Service Functions

import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Instance {
  id: number;
  name: string;
  type: 'talon' | 'contentful';
  region: string;
  url: string;
  bundleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstanceData {
  name: string;
  type: 'talon' | 'contentful';
  region: string;
  url: string;
  credentials: any;
  bundleId?: string;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
};

// Instance API
export const instanceApi = {
  list: async () => {
    const response = await apiClient.get('/instances');
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get(`/instances/${id}`);
    return response.data;
  },

  create: async (data: CreateInstanceData) => {
    const response = await apiClient.post('/instances', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateInstanceData>) => {
    const response = await apiClient.put(`/instances/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/instances/${id}`);
    return response.data;
  },

  test: async (data: { type: string; url: string; credentials: any }) => {
    const response = await apiClient.post('/instances/test', data);
    return response.data;
  },

  updateBundle: async (id: number, bundleId: string | null) => {
    const response = await apiClient.put(`/instances/${id}/bundle`, { bundleId });
    return response.data;
  },
};

// Migration API
export const migrationApi = {
  migrate: async (data: {
    sourceId: number;
    destId: number;
    assets: Array<{ type: string; id: string | number }>;
  }) => {
    const response = await apiClient.post('/migrate', data);
    return response.data;
  },
};

// Backup API
export const backupApi = {
  list: async () => {
    const response = await apiClient.get('/backups');
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get(`/backups/${id}`);
    return response.data;
  },

  create: async (data: { instanceId: number; name: string }) => {
    const response = await apiClient.post('/backups/create', data);
    return response.data;
  },

  restore: async (data: { backupId: number; targetInstanceId: number }) => {
    const response = await apiClient.post('/backups/restore', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/backups/${id}`);
    return response.data;
  },
};

// AI API
export const aiApi = {
  generate: async (data: { prompt: string; context?: any }) => {
    const response = await apiClient.post('/ai/generate', data);
    return response.data;
  },

  enhance: async (data: { prompt: string }) => {
    const response = await apiClient.post('/ai/enhance', data);
    return response.data;
  },

  feedback: async (data: { prompt: string; response: any; rating: number; feedback?: string }) => {
    const response = await apiClient.post('/ai/feedback', data);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getLogs: async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};
