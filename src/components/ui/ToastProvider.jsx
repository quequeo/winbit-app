import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast } from './Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const hideToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((payload) => {
    const next =
      typeof payload === 'string'
        ? { message: payload, type: 'info' }
        : {
            title: payload?.title,
            message: payload?.message ?? '',
            type: payload?.type ?? 'info',
            duration: payload?.duration,
          };
    setToast(next);
  }, []);

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

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
