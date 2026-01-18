import { useEffect, useState } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './FeedbackPanel.css'

interface Feedback {
  id: string
  content_id?: string
  pitch_id?: string
  reviewer_id: number
  category: 'design' | 'content' | 'technical' | 'accessibility' | 'general'
  feedback_text: string
  status: 'open' | 'addressed' | 'resolved' | 'dismissed'
  created_at: string
  reviewer?: {
    id: number
    name: string
  }
}

interface FeedbackPanelProps {
  contentId?: string
  pitchId?: string
}

export default function FeedbackPanel({ contentId, pitchId }: FeedbackPanelProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (contentId || pitchId) {
      fetchFeedback()
    }
  }, [contentId, pitchId])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = contentId 
        ? API_ENDPOINTS.feedback.byContent(contentId)
        : API_ENDPOINTS.feedback.byPitch(pitchId!)

      const response = await fetch(apiUrl(url))
      if (!response.ok) throw new Error('Failed to fetch feedback')

      const data = await response.json()
      setFeedbacks(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feedback.create), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId || undefined,
          pitch_id: pitchId || undefined,
          category: formData.get('category'),
          feedback_text: formData.get('feedback_text'),
        }),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')
      
      setShowForm(false)
      fetchFeedback()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      design: '#6f42c1',
      content: '#0d6efd',
      technical: '#fd7e14',
      accessibility: '#198754',
      general: '#6c757d',
    }
    return colors[category] || '#6c757d'
  }

  if (loading) return <div className="feedback-loading">Loading feedback...</div>
  if (error) return <div className="feedback-error">Error: {error}</div>

  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <h3>Feedback</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Feedback'}
        </button>
      </div>

      {showForm && (
        <form className="feedback-form" onSubmit={handleSubmitFeedback}>
          <select name="category" required>
            <option value="">Select Category</option>
            <option value="design">Design</option>
            <option value="content">Content</option>
            <option value="technical">Technical</option>
            <option value="accessibility">Accessibility</option>
            <option value="general">General</option>
          </select>
          <textarea 
            name="feedback_text" 
            placeholder="Your feedback..." 
            required 
            rows={4}
          />
          <button type="submit">Submit Feedback</button>
        </form>
      )}

      <div className="feedback-list">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="feedback-item">
            <div className="feedback-meta">
              <span 
                className="feedback-category"
                style={{ backgroundColor: getCategoryColor(feedback.category) }}
              >
                {feedback.category}
              </span>
              <span className="feedback-status">{feedback.status}</span>
              {feedback.reviewer && (
                <span className="feedback-reviewer">{feedback.reviewer.name}</span>
              )}
              <span className="feedback-date">
                {new Date(feedback.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="feedback-text">{feedback.feedback_text}</p>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="feedback-empty">No feedback yet. Be the first to provide feedback!</div>
      )}
    </div>
  )
}
