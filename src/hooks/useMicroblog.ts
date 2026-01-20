import { useContext } from 'react'
import { MicroblogContext, type MicroblogContextType } from '../contexts/MicroblogContext'

export function useMicroblog(): MicroblogContextType {
  const context = useContext(MicroblogContext)

  if (context === undefined) {
    throw new Error('useMicroblog must be used within a MicroblogProvider')
  }

  return context
}
