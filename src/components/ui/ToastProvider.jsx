import { useCallback, useMemo, useState } from 'react';
import { Toast } from './Toast';
import { ToastContext } from './toastContext';

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((payload) => {
    setToast({
      type: 'success',
      duration: 6000,
      ...payload,
    });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      ) : null}
    </ToastContext.Provider>
  );
};
