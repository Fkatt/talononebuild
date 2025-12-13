// React Query Hooks for Migration

import { useMutation } from '@tanstack/react-query';
import { migrationApi } from '../api/services';

export const useMigrate = () => {
  return useMutation({
    mutationFn: (data: {
      sourceId: number;
      destId: number;
      assets: Array<{ type: string; id: string | number }>;
    }) => migrationApi.migrate(data),
  });
};
