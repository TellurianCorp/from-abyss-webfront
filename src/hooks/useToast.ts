import { useContext } from 'react';
import { ToastContext, type ToastContextType } from '../contexts/ToastContext.context';

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export type { Toast, ToastType } from '../contexts/ToastContext';
