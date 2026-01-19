import React from 'react';
import { useToast, type Toast } from '../hooks/useToast';
import './Toaster.css';

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toaster-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-message">{toast.message}</div>
            {toast.action && (
              <button
                className="toast-action"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
