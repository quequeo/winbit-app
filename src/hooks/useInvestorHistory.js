import { useQuery } from '@tanstack/react-query';
import { getInvestorHistory } from '../services/api';
import { useAuth } from './useAuth';

export const useInvestorHistory = (email) => {
  const { isValidated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['investor', email, 'history'],
    queryFn: async () => {
      const result = await getInvestorHistory(email);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!email && !!isValidated,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
