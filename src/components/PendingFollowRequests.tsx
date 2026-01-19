import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl, API_ENDPOINTS } from '../utils/api';
import './PendingFollowRequests.css';

interface Follower {
  id: string;
  actor_uri: string;
  username: string;
  display_name: string;
  domain: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
}

interface FollowRequest {
  id: string;
  follower_actor_id: string;
  status: string;
  created_at: string;
  follower: Follower;
}

interface PendingFollowRequestsProps {
  onUpdate?: () => void;
}

const PendingFollowRequests: React.FC<PendingFollowRequestsProps> = ({ onUpdate }) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingFollows = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.pendingFollows), {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else if (response.status === 404) {
        setRequests([]);
      } else {
        setError(t('activitypub.followRequests.error.fetch', 'Failed to load follow requests'));
      }
    } catch (err) {
      console.error('Error fetching pending follow requests:', err);
      setError(t('activitypub.followRequests.error.fetch', 'Failed to load follow requests'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendingFollows();
  }, [fetchPendingFollows]);

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.approveFollowRequest(requestId)), {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove from list
        setRequests(requests.filter(r => r.id !== requestId));
        onUpdate?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || t('activitypub.followRequests.error.approve', 'Failed to approve request'));
      }
    } catch (err) {
      console.error('Error approving follow request:', err);
      alert(t('activitypub.followRequests.error.approve', 'Failed to approve request'));
    }
  };

  const handleReject = async (requestId: string) => {
    if (!window.confirm(t('activitypub.followRequests.confirmReject', 'Are you sure you want to reject this follow request?'))) {
      return;
    }

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.rejectFollowRequest(requestId)), {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove from list
        setRequests(requests.filter(r => r.id !== requestId));
        onUpdate?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || t('activitypub.followRequests.error.reject', 'Failed to reject request'));
      }
    } catch (err) {
      console.error('Error rejecting follow request:', err);
      alert(t('activitypub.followRequests.error.reject', 'Failed to reject request'));
    }
  };

  if (isLoading) {
    return (
      <div className="pending-follow-requests">
        <div className="pending-follow-requests-loading">
          {t('activitypub.followRequests.loading', 'Loading...')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-follow-requests">
        <div className="pending-follow-requests-error">{error}</div>
        <button onClick={fetchPendingFollows} className="pending-follow-requests-retry">
          {t('activitypub.followRequests.retry', 'Retry')}
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="pending-follow-requests">
        <div className="pending-follow-requests-empty">
          {t('activitypub.followRequests.empty', 'No pending follow requests')}
        </div>
      </div>
    );
  }

  return (
    <div className="pending-follow-requests">
      <h3 className="pending-follow-requests-title">
        {t('activitypub.followRequests.title', 'Pending Follow Requests')} ({requests.length})
      </h3>
      <div className="pending-follow-requests-list">
        {requests.map((request) => (
          <div key={request.id} className="pending-follow-request-item">
            <div className="pending-follow-request-header">
              {request.follower.avatar_url && (
                <img
                  src={request.follower.avatar_url}
                  alt={request.follower.display_name || request.follower.username}
                  className="pending-follow-request-avatar"
                />
              )}
              <div className="pending-follow-request-info">
                <div className="pending-follow-request-name">
                  {request.follower.display_name || request.follower.username}
                </div>
                <div className="pending-follow-request-handle">
                  @{request.follower.username}@{request.follower.domain}
                </div>
                {request.follower.bio && (
                  <div className="pending-follow-request-bio">{request.follower.bio}</div>
                )}
              </div>
            </div>
            <div className="pending-follow-request-actions">
              <button
                onClick={() => handleApprove(request.id)}
                className="pending-follow-request-approve"
              >
                {t('activitypub.followRequests.approve', 'Approve')}
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className="pending-follow-request-reject"
              >
                {t('activitypub.followRequests.reject', 'Reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingFollowRequests;
