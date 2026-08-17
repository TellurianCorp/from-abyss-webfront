import { useEffect, useRef, useCallback } from 'react'
import { useVisibility } from './useVisibility'

interface UseSmartPollingOptions {
  callback: () => void | Promise<void>
  interval: number
  enabled?: boolean
  pauseWhenHidden?: boolean
  immediate?: boolean
}

/**
 * Smart polling hook that:
 * - Pauses when tab is hidden (saves resources)
 * - Supports immediate execution
 * - Handles async callbacks
 * - Cleans up properly
 */
export function useSmartPolling(options: UseSmartPollingOptions) {
  const {
    callback,
    interval,
    enabled = true,
    pauseWhenHidden = true,
    immediate = false,
  } = options

  const isVisible = useVisibility()
  // ReturnType<typeof setInterval> rather than number: the browser returns a
  // number but Node's typings return a Timeout object, and both are in scope in
  // this project. Naming the concrete type made the file compile only as long as
  // Node's globals happened not to be pulled into the app project.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const executeCallback = useCallback(async () => {
    try {
      await callbackRef.current()
    } catch (error) {
      console.error('Error in polling callback:', error)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Pause when hidden if enabled
    if (pauseWhenHidden && !isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Execute immediately if requested
    if (immediate) {
      executeCallback()
    }

    // Set up interval
    intervalRef.current = setInterval(executeCallback, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, isVisible, pauseWhenHidden, immediate, executeCallback])

  // Execute when tab becomes visible again
  useEffect(() => {
    if (enabled && isVisible && pauseWhenHidden && immediate) {
      executeCallback()
    }
  }, [enabled, isVisible, pauseWhenHidden, immediate, executeCallback])
}
