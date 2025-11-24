import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '',
  children = 'Sign In'
}) => {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className={`login-button ${className}`}
      type="button"
    >
      {children}
    </button>
  );
};
