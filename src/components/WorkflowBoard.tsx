import { useEffect, useState } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './WorkflowBoard.css'

interface Workflow {
  id: string
  content_id?: string
  pitch_id?: string
  stage: string
  assignee_id?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  due_date?: string
  notes?: string
  created_at: string
  assignee?: {
    id: number
    name: string
  }
}

interface WorkflowBoardProps {
  contentId?: string
  pitchId?: string
}

export default function WorkflowBoard({ contentId, pitchId }: WorkflowBoardProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (contentId || pitchId) {
      fetchWorkflows()
    }
  }, [contentId, pitchId])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = contentId 
        ? API_ENDPOINTS.workflows.byContent(contentId)
        : API_ENDPOINTS.workflows.byPitch(pitchId!)

      const response = await fetch(apiUrl(url))
      if (!response.ok) throw new Error('Failed to fetch workflows')

      const data = await response.json()
      setWorkflows(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.workflows.create), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId || undefined,
          pitch_id: pitchId || undefined,
          stage: formData.get('stage'),
          priority: formData.get('priority') || 'medium',
          notes: formData.get('notes') || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create workflow')
      
      setShowForm(false)
      fetchWorkflows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#6c757d',
      medium: '#0d6efd',
      high: '#fd7e14',
      urgent: '#dc3545',
    }
    return colors[priority] || '#6c757d'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#6c757d',
      in_progress: '#0d6efd',
      completed: '#198754',
      blocked: '#dc3545',
      cancelled: '#6c757d',
    }
    return colors[status] || '#6c757d'
  }

  if (loading) return <div className="workflow-loading">Loading workflows...</div>
  if (error) return <div className="workflow-error">Error: {error}</div>

  return (
    <div className="workflow-board">
      <div className="workflow-header">
        <h3>Workflow</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Stage'}
        </button>
      </div>

      {showForm && (
        <form className="workflow-form" onSubmit={handleCreateWorkflow}>
          <input name="stage" placeholder="Stage name" required />
          <select name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <textarea name="notes" placeholder="Notes (optional)" rows={3} />
          <button type="submit">Create Stage</button>
        </form>
      )}

      <div className="workflow-list">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="workflow-item">
            <div className="workflow-header-item">
              <h4>{workflow.stage}</h4>
              <div className="workflow-badges">
                <span 
                  className="workflow-priority"
                  style={{ backgroundColor: getPriorityColor(workflow.priority) }}
                >
                  {workflow.priority}
                </span>
                <span 
                  className="workflow-status"
                  style={{ backgroundColor: getStatusColor(workflow.status) }}
                >
                  {workflow.status}
                </span>
              </div>
            </div>
            {workflow.assignee && (
              <p className="workflow-assignee">Assigned to: {workflow.assignee.name}</p>
            )}
            {workflow.notes && (
              <p className="workflow-notes">{workflow.notes}</p>
            )}
            {workflow.due_date && (
              <p className="workflow-due">
                Due: {new Date(workflow.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="workflow-empty">No workflow stages yet. Add one to get started!</div>
      )}
    </div>
  )
}
