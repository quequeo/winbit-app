import { useQuery } from '@tanstack/react-query';
import { getPaymentMethods } from '../services/api';

/**
 * Métodos de pago activos para depósito o retiro (configurados en el backend).
 * @param {'deposit'|'withdrawal'} flow
 */
export const usePaymentMethods = (flow = 'withdrawal') => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymentMethods', flow],
    queryFn: async () => {
      const result = await getPaymentMethods(flow);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  return {
    paymentMethods: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
