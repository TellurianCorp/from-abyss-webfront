import { createContext } from 'react'
import type { ActivityPubContextType } from './ActivityPubContext'

// Kept out of the .tsx so that file only exports components and stays Fast Refresh friendly.
export const ActivityPubContext = createContext<ActivityPubContextType | undefined>(undefined)
