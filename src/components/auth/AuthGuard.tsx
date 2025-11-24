import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginButton } from './LoginButton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  loadingComponent 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="auth-guard__loading">
            <div className="spinner">Loading...</div>
          </div>
        )}
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="auth-guard__unauthenticated">
            <h2>Authentication Required</h2>
            <p>Please sign in to access this content.</p>
            <LoginButton />
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};
