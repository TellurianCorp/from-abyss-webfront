import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './FollowButton.css';

interface FollowButtonProps {
  actorId: string;
  userId: string;
  isFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  actorId, 
  userId, 
  isFollowing: initialFollowing = false,
  onFollowChange 
}) => {
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleFollow = async () => {
    if (!userId || !actorId) {
      setError(t('microblog.follow.error.missingParams'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/microblog/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          followingId: actorId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('microblog.follow.error.failed'));
      }

      setIsFollowing(true);
      onFollowChange?.(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('microblog.follow.error.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !actorId) {
      setError(t('microblog.follow.error.missingParams'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/microblog/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          followingId: actorId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('microblog.follow.error.failed'));
      }

      setIsFollowing(false);
      onFollowChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('microblog.follow.error.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="follow-button-container">
      {isFollowing ? (
        <button
          className="follow-button unfollow"
          onClick={handleUnfollow}
          disabled={isLoading}
        >
          {isLoading ? t('microblog.follow.unfollowing') : t('microblog.follow.unfollow')}
        </button>
      ) : (
        <button
          className="follow-button follow"
          onClick={handleFollow}
          disabled={isLoading}
        >
          {isLoading ? t('microblog.follow.following') : t('microblog.follow.follow')}
        </button>
      )}
      {error && <div className="follow-error">{error}</div>}
    </div>
  );
};

export default FollowButton;
