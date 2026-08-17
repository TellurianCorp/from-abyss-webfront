import { createContext } from 'react';
import type { Toast } from './ToastContext';

export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
}

// Kept out of the .tsx so that file only exports components and stays Fast Refresh friendly.
export const ToastContext = createContext<ToastContextType | undefined>(undefined);
