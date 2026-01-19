import React from 'react';
import { useTranslation } from 'react-i18next';
import './ActorProfile.css';

interface ActorProfileProps {
  actor: {
    id?: string;
    actor_uri?: string;
    username: string;
    display_name?: string;
    domain?: string;
    avatar_url?: string;
    banner_url?: string;
    bio?: string;
  };
  showBanner?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ActorProfile: React.FC<ActorProfileProps> = ({
  actor,
  showBanner = true,
  size = 'medium',
}) => {
  const { t } = useTranslation();

  const displayName = actor.display_name || actor.username;
  const handle = actor.domain
    ? `@${actor.username}@${actor.domain}`
    : `@${actor.username}`;

  return (
    <div className={`actor-profile actor-profile-${size}`}>
      {showBanner && actor.banner_url && (
        <div className="actor-profile-banner">
          <img
            src={actor.banner_url}
            alt={`${displayName} banner`}
            className="actor-profile-banner-image"
          />
        </div>
      )}
      <div className="actor-profile-content">
        <div className="actor-profile-avatar-container">
          {actor.avatar_url ? (
            <img
              src={actor.avatar_url}
              alt={displayName}
              className="actor-profile-avatar"
            />
          ) : (
            <div className="actor-profile-avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="actor-profile-info">
          <div className="actor-profile-name">{displayName}</div>
          <div className="actor-profile-handle">{handle}</div>
          {actor.bio && (
            <div className="actor-profile-bio">{actor.bio}</div>
          )}
        </div>
      </div>
    </div>
  );
};
