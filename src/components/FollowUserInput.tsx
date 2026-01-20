import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl, API_ENDPOINTS } from '../utils/api';
import { useToast } from '../hooks/useToast';
import './FollowUserInput.css';

interface FollowUserInputProps {
  onFollowSuccess?: () => void;
}

const FollowUserInput: React.FC<FollowUserInputProps> = ({ onFollowSuccess }) => {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Convert handle to actor URI
  const handleToActorURI = (input: string): string => {
    // Remove leading @ if present
    const cleanHandle = input.trim().replace(/^@+/, '');
    
    if (!cleanHandle) {
      throw new Error(t('microblog.followUserInput.error.invalidHandle'));
    }

    // Check if it's a federated handle (contains @)
    if (cleanHandle.includes('@')) {
      const [username, domain] = cleanHandle.split('@');
      if (!username || !domain) {
        throw new Error(t('microblog.followUserInput.error.invalidFederatedHandle'));
      }
      // Return ActivityPub actor URI
      return `https://${domain}/actors/${username}`;
    }

    // Local handle - use current domain
    // In production, this should come from config or environment
    // For local development, use localhost:8080, otherwise use the current hostname
    let currentDomain = window.location.hostname;
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      // In development, API might be on a different port
      currentDomain = 'localhost:8080';
    } else if (!currentDomain.includes(':')) {
      // If no port, assume standard HTTPS
      currentDomain = currentDomain;
    }
    
    // Use https for production, http for localhost
    const protocol = currentDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${currentDomain}/actors/${cleanHandle}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!handle.trim()) {
      showError(t('microblog.followUserInput.error.emptyHandle'), t('common.error'));
      return;
    }

    setIsLoading(true);
    
    try {
      const actorURI = handleToActorURI(handle);
      
      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.follow), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          actor_uri: actorURI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || t('microblog.followUserInput.error.failed'));
      }

      // Response is successful, no need to parse JSON
      success(t('microblog.followUserInput.success', { handle: handle.trim() }));
      setHandle('');
      onFollowSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('microblog.followUserInput.error.failed');
      showError(errorMessage, t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="follow-user-input-container">
      <form onSubmit={handleSubmit} className="follow-user-input-form">
        <div className="follow-user-input-wrapper">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={t('microblog.followUserInput.placeholder')}
            className="follow-user-input"
            disabled={isLoading}
            aria-label={t('microblog.followUserInput.label')}
          />
          <button
            type="submit"
            className="follow-user-input-button"
            disabled={isLoading || !handle.trim()}
            aria-label={t('microblog.followUserInput.submit')}
          >
            {isLoading ? t('microblog.followUserInput.submitting') : t('microblog.followUserInput.submit')}
          </button>
        </div>
        <p className="follow-user-input-hint">
          {t('microblog.followUserInput.hint')}
        </p>
      </form>
    </div>
  );
};

export default FollowUserInput;
