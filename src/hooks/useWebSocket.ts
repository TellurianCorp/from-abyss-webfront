import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions<T> {
  url: string
  reconnectInterval?: number
  reconnectAttempts?: number
  onMessage?: (data: T) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  enabled?: boolean
}

export function useWebSocket<T = unknown>(options: UseWebSocketOptions<T>) {
  const {
    url,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    onMessage,
    onError,
    onOpen,
    onClose,
    enabled = true,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<T | null>(null)
  const [error, setError] = useState<Event | null>(null)
  // Bumping this re-runs the effect below, which is how both the retry timer
  // and the exposed reconnect() open a fresh socket.
  const [connectionAttempt, setConnectionAttempt] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const reconnectCountRef = useRef(0)
  const shouldReconnectRef = useRef(true)

  useEffect(() => {
    if (!enabled || !url) return

    shouldReconnectRef.current = true
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      reconnectCountRef.current = 0
      onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T
        setLastMessage(data)
        onMessage?.(data)
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    ws.onerror = (event) => {
      setError(event)
      onError?.(event)
    }

    ws.onclose = () => {
      setIsConnected(false)
      onClose?.()

      // Auto-reconnect logic
      if (shouldReconnectRef.current && reconnectCountRef.current < reconnectAttempts) {
        reconnectCountRef.current += 1
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionAttempt((attempt) => attempt + 1)
        }, reconnectInterval)
      }
    }

    return () => {
      // Closing here fires onclose; suppress the retry so only an explicit
      // reconnect or a dependency change opens the next socket.
      shouldReconnectRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      ws.close()
      wsRef.current = null
    }
  }, [
    url,
    enabled,
    connectionAttempt,
    reconnectInterval,
    reconnectAttempts,
    onMessage,
    onError,
    onOpen,
    onClose,
  ])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0
    setConnectionAttempt((attempt) => attempt + 1)
  }, [])

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    disconnect,
    reconnect,
  }
}
