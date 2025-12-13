// React Query Hooks for Instance Management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instanceApi, type CreateInstanceData } from '../api/services';

export const useInstances = () => {
  return useQuery({
    queryKey: ['instances'],
    queryFn: async () => {
      const response = await instanceApi.list();
      return response.data;
    },
  });
};

export const useInstance = (id: number) => {
  return useQuery({
    queryKey: ['instances', id],
    queryFn: async () => {
      const response = await instanceApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInstanceData) => instanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
};

export const useUpdateInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateInstanceData> }) =>
      instanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
};

export const useDeleteInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => instanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: (data: { type: string; url: string; credentials: any }) =>
      instanceApi.test(data),
  });
};

export const useUpdateInstanceBundle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bundleId }: { id: number; bundleId: string | null }) =>
      instanceApi.updateBundle(id, bundleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
  });
};
