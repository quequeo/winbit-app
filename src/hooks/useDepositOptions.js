import { useQuery } from '@tanstack/react-query';
import { getDepositOptions } from '../services/api';

/**
 * Hook para obtener las opciones de depósito activas desde el backend
 * @returns {Object} { depositOptions, loading, error }
 */
export const useDepositOptions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['depositOptions'],
    queryFn: async () => {
      const result = await getDepositOptions();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  return {
    depositOptions: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
