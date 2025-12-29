import { useCallback, useEffect, useState } from 'react';
import { getInvestorHistory } from '../services/sheets';

export const useInvestorHistory = (email) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!email) {
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
  }, [email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};



