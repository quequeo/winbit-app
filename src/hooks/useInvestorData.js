import { useQuery } from '@tanstack/react-query';
import { getInvestorData } from '../services/api';
import { useAuth } from './useAuth';

export const useInvestorData = (email) => {
  const { isValidated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['investor', email],
    queryFn: async () => {
      const result = await getInvestorData(email);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!email && !!isValidated,
    retry: false, // Don't retry on 404/403
  });

  // Calculate unauthorized state from error message
  const errorMessage = error?.message;
  const unauthorized =
    errorMessage?.includes('Investor not found in database') ||
    errorMessage?.includes('Investor email mapping not configured') ||
    errorMessage?.includes('not found in sheet');

  // If unauthorized, we clear the general error string to match old behavior
  // (In old hook: "setUnauthorized(true); setError(null);")
  const exposedError = unauthorized ? null : errorMessage || null;

  return {
    data: data || null,
    loading: isLoading, // Map isLoading to loading
    error: exposedError,
    unauthorized: !!unauthorized,
    refetch,
  };
};
