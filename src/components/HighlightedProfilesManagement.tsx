import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './FeediverseManagement.css'

interface HighlightedProfile {
  id: string
  acct: string
  username: string
  domain: string
  display_name?: string
  avatar_url?: string
  bio?: string
  profile_url: string
  instance_url?: string
  protocol: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface CreateProfileForm {
  acct: string
  display_name: string
  avatar_url: string
  bio: string
  profile_url: string
  instance_url: string
  protocol: string
  display_order: number
}

export function HighlightedProfilesManagement() {
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<HighlightedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<HighlightedProfile | null>(null)
  const [formData, setFormData] = useState<CreateProfileForm>({
    acct: '',
    display_name: '',
    avatar_url: '',
    bio: '',
    profile_url: '',
    instance_url: '',
    protocol: 'activitypub',
    display_order: 0,
  })

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feediverse.admin.highlightedProfiles.list), {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.status}`)
      }

      const data = await response.json()
      setProfiles(data.data || [])
    } catch (err) {
      console.error('Error fetching highlighted profiles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const url = editingProfile
        ? apiUrl(API_ENDPOINTS.feediverse.admin.highlightedProfiles.update(editingProfile.id))
        : apiUrl(API_ENDPOINTS.feediverse.admin.highlightedProfiles.create)

      const method = editingProfile ? 'PUT' : 'POST'
      const body = editingProfile
        ? {
            display_name: formData.display_name || undefined,
            avatar_url: formData.avatar_url || undefined,
            bio: formData.bio || undefined,
            profile_url: formData.profile_url || undefined,
            instance_url: formData.instance_url || undefined,
            protocol: formData.protocol,
            display_order: formData.display_order,
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to save profile')
      }

      // Reset form and refresh list
      setShowForm(false)
      setEditingProfile(null)
      setFormData({
        acct: '',
        display_name: '',
        avatar_url: '',
        bio: '',
        profile_url: '',
        instance_url: '',
        protocol: 'activitypub',
        display_order: 0,
      })
      fetchProfiles()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    }
  }

  const handleEdit = (profile: HighlightedProfile) => {
    setEditingProfile(profile)
    setFormData({
      acct: profile.acct,
      display_name: profile.display_name || '',
      avatar_url: profile.avatar_url || '',
      bio: profile.bio || '',
      profile_url: profile.profile_url,
      instance_url: profile.instance_url || '',
      protocol: profile.protocol,
      display_order: profile.display_order,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return
    }

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feediverse.admin.highlightedProfiles.delete(id)), {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete profile')
      }

      fetchProfiles()
    } catch (err) {
      console.error('Error deleting profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
    }
  }

  const handleToggleActive = async (profile: HighlightedProfile) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feediverse.admin.highlightedProfiles.update(profile.id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          is_active: !profile.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      fetchProfiles()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="feediverse-management">
        <div className="feediverse-loading">
          <p>{t('feediverse.admin.loading', 'Loading profiles...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="feediverse-management">
      <div className="feediverse-header">
        <h3>Highlighted Profiles</h3>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingProfile(null)
            setFormData({
              acct: '',
              display_name: '',
              avatar_url: '',
              bio: '',
              profile_url: '',
              instance_url: '',
              protocol: 'activitypub',
              display_order: 0,
            })
          }}
          className="feediverse-btn feediverse-btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Profile'}
        </button>
      </div>

      {error && (
        <div className="feediverse-error">
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="feediverse-form">
          <h4>{editingProfile ? 'Edit Profile' : 'Add New Profile'}</h4>
          
          {!editingProfile && (
            <div className="feediverse-form-group">
              <label>
                Acct (e.g., @username@domain.com) *
                <input
                  type="text"
                  value={formData.acct}
                  onChange={(e) => setFormData({ ...formData, acct: e.target.value })}
                  placeholder="@username@domain.com"
                  required
                />
              </label>
            </div>
          )}

          <div className="feediverse-form-group">
            <label>
              Display Name
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Display Name"
              />
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Profile URL *
              <input
                type="url"
                value={formData.profile_url}
                onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                placeholder="https://mastodon.social/@username"
                required
              />
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Instance URL
              <input
                type="url"
                value={formData.instance_url}
                onChange={(e) => setFormData({ ...formData, instance_url: e.target.value })}
                placeholder="https://mastodon.social"
              />
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Avatar URL
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Bio
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Profile bio/description"
                rows={3}
              />
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Protocol *
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                required
              >
                <option value="activitypub">ActivityPub</option>
                <option value="atproto">AT Protocol</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          </div>

          <div className="feediverse-form-group">
            <label>
              Display Order
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </label>
          </div>

          <div className="feediverse-form-actions">
            <button type="submit" className="feediverse-btn feediverse-btn-primary">
              {editingProfile ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingProfile(null)
              }}
              className="feediverse-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="feediverse-profiles-list">
        {profiles.length === 0 ? (
          <p>No highlighted profiles yet. Add one to get started!</p>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="feediverse-profile-card">
              <div className="feediverse-profile-header">
                {profile.avatar_url && (
                  <img src={profile.avatar_url} alt={profile.display_name || profile.username} className="feediverse-profile-avatar" />
                )}
                <div className="feediverse-profile-info">
                  <h4>{profile.display_name || profile.username}</h4>
                  <p className="feediverse-profile-acct">{profile.acct}</p>
                  {profile.bio && <p className="feediverse-profile-bio">{profile.bio}</p>}
                </div>
                <div className="feediverse-profile-status">
                  <span className={profile.is_active ? 'status-active' : 'status-inactive'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="feediverse-profile-details">
                <p><strong>Protocol:</strong> {profile.protocol}</p>
                <p><strong>Display Order:</strong> {profile.display_order}</p>
                <p><strong>Profile URL:</strong> <a href={profile.profile_url} target="_blank" rel="noopener noreferrer">{profile.profile_url}</a></p>
              </div>
              <div className="feediverse-profile-actions">
                <button
                  onClick={() => handleToggleActive(profile)}
                  className={`feediverse-btn ${profile.is_active ? 'feediverse-btn-warning' : 'feediverse-btn-success'}`}
                >
                  {profile.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(profile)}
                  className="feediverse-btn feediverse-btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="feediverse-btn feediverse-btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
