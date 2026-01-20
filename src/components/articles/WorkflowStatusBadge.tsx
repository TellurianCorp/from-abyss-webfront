import './WorkflowStatusBadge.css'

interface WorkflowStatusBadgeProps {
  status: 'draft' | 'in_review' | 'reviewed' | 'approved' | 'published' | 'archived'
}

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  in_review: 'Em Revisão',
  reviewed: 'Revisado',
  approved: 'Aprovado',
  published: 'Publicado',
  archived: 'Arquivado',
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return (
    <span className={`workflow-status-badge workflow-status-${status}`}>
      {statusLabels[status] || status}
    </span>
  )
}
