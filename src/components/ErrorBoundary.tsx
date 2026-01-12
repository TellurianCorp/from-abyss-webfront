import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component to catch and handle React errors
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // TODO: Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

interface FallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, errorInfo, onReset }: FallbackProps): React.ReactElement {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '2rem auto',
        border: '1px solid #dc3545',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
      }}
    >
      <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
        Something went wrong
      </h1>

      <p style={{ marginBottom: '1rem' }}>
        We're sorry for the inconvenience. An error occurred while rendering this component.
      </p>

      <button
        onClick={onReset}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        Try Again
      </button>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginLeft: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        Reload Page
      </button>

      {import.meta.env.DEV && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Error Details
          </summary>
          <div style={{ marginTop: '1rem' }}>
            <strong>Error:</strong>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '0.5rem',
              }}
            >
              {error?.toString()}
            </pre>

            {errorInfo && (
              <>
                <strong style={{ display: 'block', marginTop: '1rem' }}>
                  Component Stack:
                </strong>
                <pre
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginTop: '0.5rem',
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

/**
 * Hook to use error boundary imperatively
 * Throws an error to trigger the nearest error boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useThrowError(): (error: Error) => void {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

export default ErrorBoundary
