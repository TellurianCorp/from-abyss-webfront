import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '',
  children = 'Sign Out'
}) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`logout-button ${className}`}
      type="button"
    >
      {isLoading ? 'Signing out...' : children}
    </button>
  );
};
