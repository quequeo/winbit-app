import { useEffect, useState } from 'react';

/** Show loading UI only after `delayMs` to avoid flash on fast loads. */
export const useDelayedLoading = (loading, delayMs = 300) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return undefined;
    }

    const timer = setTimeout(() => setShowLoading(true), delayMs);
    return () => clearTimeout(timer);
  }, [loading, delayMs]);

  return showLoading;
};
