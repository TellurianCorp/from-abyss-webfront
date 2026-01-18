import { useEffect, useState } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './PitchBoard.css'

interface Pitch {
  id: string
  creator_id: number
  title: string
  description?: string
  target_audience?: string
  estimated_effort?: number
  success_metrics?: string
  thumbnail_url?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'published'
  created_at: string
  updated_at: string
  creator?: {
    id: number
    name: string
    email: string
  }
}

interface PitchBoardProps {
  creatorId?: number
  status?: string
}

export default function PitchBoard({ creatorId, status }: PitchBoardProps) {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchPitches()
  }, [creatorId, status])

  const fetchPitches = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = API_ENDPOINTS.pitches.list
      const params = new URLSearchParams()
      if (creatorId) params.append('creator_id', creatorId.toString())
      if (status) params.append('status', status)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(apiUrl(url))
      if (!response.ok) throw new Error('Failed to fetch pitches')

      const data = await response.json()
      setPitches(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePitch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.pitches.create), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description') || undefined,
          target_audience: formData.get('target_audience') || undefined,
          estimated_effort: formData.get('estimated_effort') ? parseInt(formData.get('estimated_effort') as string) : undefined,
          success_metrics: formData.get('success_metrics') || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create pitch')
      
      setShowCreateForm(false)
      fetchPitches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#6c757d',
      submitted: '#0d6efd',
      approved: '#198754',
      rejected: '#dc3545',
      in_progress: '#ffc107',
      published: '#198754',
    }
    return colors[status] || '#6c757d'
  }

  if (loading) return <div className="pitch-board-loading">Loading pitches...</div>
  if (error) return <div className="pitch-board-error">Error: {error}</div>

  return (
    <div className="pitch-board">
      <div className="pitch-board-header">
        <h2>Content Pitches</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'New Pitch'}
        </button>
      </div>

      {showCreateForm && (
        <form className="pitch-create-form" onSubmit={handleCreatePitch}>
          <input name="title" placeholder="Title" required />
          <textarea name="description" placeholder="Description" />
          <input name="target_audience" placeholder="Target Audience" />
          <input name="estimated_effort" type="number" placeholder="Estimated Effort (hours)" />
          <textarea name="success_metrics" placeholder="Success Metrics" />
          <button type="submit">Create Pitch</button>
        </form>
      )}

      <div className="pitch-list">
        {pitches.map((pitch) => (
          <div key={pitch.id} className="pitch-card">
            <div className="pitch-header">
              <h3>{pitch.title}</h3>
              <span 
                className="pitch-status" 
                style={{ backgroundColor: getStatusColor(pitch.status) }}
              >
                {pitch.status}
              </span>
            </div>
            {pitch.description && <p className="pitch-description">{pitch.description}</p>}
            {pitch.target_audience && (
              <p className="pitch-meta">Audience: {pitch.target_audience}</p>
            )}
            {pitch.estimated_effort && (
              <p className="pitch-meta">Effort: {pitch.estimated_effort} hours</p>
            )}
            <div className="pitch-footer">
              <span className="pitch-date">
                {new Date(pitch.created_at).toLocaleDateString()}
              </span>
              {pitch.creator && (
                <span className="pitch-creator">by {pitch.creator.name}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {pitches.length === 0 && (
        <div className="pitch-empty">No pitches found. Create one to get started!</div>
      )}
    </div>
  )
}
