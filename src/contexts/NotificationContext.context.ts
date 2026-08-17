import { createContext } from 'react'
import type { NotificationContextType } from './NotificationContext'

// Kept out of the .tsx so that file only exports components and stays Fast Refresh friendly.
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)
