import { useState, useEffect } from 'react';
import { getWallets } from '../services/api';

/**
 * Hook para obtener las wallets desde el backend
 * @returns {Object} { wallets, loading, error }
 */
export const useWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getWallets();

        if (result.error) {
          throw new Error(result.error);
        }

        setWallets(result.data || []);
      } catch (err) {
        setError(err.message);
        setWallets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  return { wallets, loading, error };
};
