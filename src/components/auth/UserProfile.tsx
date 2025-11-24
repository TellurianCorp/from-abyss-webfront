import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from './LogoutButton';

interface UserProfileProps {
  className?: string;
  showLogout?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  className = '',
  showLogout = true
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`user-profile ${className}`}>
      <div className="user-profile__info">
        {user.picture && (
          <img 
            src={user.picture} 
            alt={user.name}
            className="user-profile__avatar"
          />
        )}
        <div className="user-profile__details">
          <div className="user-profile__name">{user.name}</div>
          <div className="user-profile__email">{user.email}</div>
          {user.email_verified && (
            <span className="user-profile__verified">✓ Verified</span>
          )}
        </div>
      </div>
      {showLogout && (
        <div className="user-profile__actions">
          <LogoutButton />
        </div>
      )}
    </div>
  );
};
