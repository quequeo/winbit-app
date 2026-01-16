import { useQuery } from '@tanstack/react-query';
import { getWallets } from '../services/api';

/**
 * Hook para obtener las wallets desde el backend
 * @returns {Object} { wallets, loading, error }
 */
export const useWallets = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const result = await getWallets();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60, // Cache wallets for 1 hour
  });

  return {
    wallets: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
