import { useContext } from 'react';
import { ToastContext } from '../components/ui/toastContext';

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
