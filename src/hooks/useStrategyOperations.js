import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStrategyOperations } from '../services/api';
import { getOperatingStrategyKnownOps } from '../config/operatingStrategyFallbackData';
import { buildStrategyByDateForHistory, combineStrategyOperations } from '../utils/operatingTrade';

export const useStrategyOperations = (enabled = true, history = null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['strategy-operations'],
    queryFn: async () => {
      const result = await getStrategyOperations();
      return combineStrategyOperations(getOperatingStrategyKnownOps(), result.data || []);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const strategyByDate = useMemo(
    () => buildStrategyByDateForHistory(history, data || []),
    [history, data],
  );

  return {
    data: Object.values(strategyByDate),
    strategyByDate,
    loading: isLoading,
    error: error?.message || null,
  };
};
