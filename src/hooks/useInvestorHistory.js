import { useCallback, useEffect, useState } from 'react';
import { getInvestorHistory } from '../services/api';
import { useAuth } from './useAuth';

export const useInvestorHistory = (email) => {
  const { isValidated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // No intentar cargar datos hasta que el usuario esté validado
    if (!email || !isValidated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getInvestorHistory(email);

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [email, isValidated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
