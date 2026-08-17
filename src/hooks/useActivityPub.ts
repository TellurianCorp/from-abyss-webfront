import { useContext } from 'react'
import { ActivityPubContext } from '../contexts/ActivityPubContext.context'
import type { ActivityPubContextType } from '../contexts/ActivityPubContext'

export function useActivityPub(): ActivityPubContextType {
  const context = useContext(ActivityPubContext)

  if (context === undefined) {
    throw new Error('useActivityPub must be used within an ActivityPubProvider')
  }

  return context
}
