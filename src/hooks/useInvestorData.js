import { useState, useEffect, useCallback } from 'react';
import { getInvestorData } from '../services/api';
import { useAuth } from './useAuth';

export const useInvestorData = (email) => {
  const { isValidated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchData = useCallback(async () => {
    // No intentar cargar datos hasta que el usuario esté validado
    if (!email || !isValidated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      const result = await getInvestorData(email);

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data);
    } catch (err) {
      const errorMessage = err.message;

      // Check for unauthorized user errors
      if (
        errorMessage.includes('Investor not found in database') ||
        errorMessage.includes('Investor email mapping not configured') ||
        errorMessage.includes('not found in sheet')
      ) {
        setUnauthorized(true);
        setError(null);
      } else {
        setError(errorMessage);
        setUnauthorized(false);
      }

      setData(null);
    } finally {
      setLoading(false);
    }
  }, [email, isValidated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, unauthorized, refetch: fetchData };
};
