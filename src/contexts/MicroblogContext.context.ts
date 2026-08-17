import { createContext } from 'react'
import type { MicroblogContextType } from './MicroblogContext'

// Kept out of the .tsx so that file only exports components and stays Fast Refresh friendly.
export const MicroblogContext = createContext<MicroblogContextType | undefined>(undefined)
