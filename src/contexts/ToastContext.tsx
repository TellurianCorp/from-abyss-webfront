import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './ToastContext.context';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'success', message, title, duration });
  }, [showToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'error', message, title, duration: duration ?? 7000 });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'warning', message, title, duration });
  }, [showToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    return showToast({ type: 'info', message, title, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
