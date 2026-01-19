import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './PostComposer.css'

interface PostComposerProps {
  onPostCreated?: () => void
}

type Visibility = 'public' | 'unlisted' | 'followers' | 'private'

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [contentWarning, setContentWarning] = useState('')
  const [showContentWarning, setShowContentWarning] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_CHARACTERS = 500
  const remainingCharacters = MAX_CHARACTERS - content.length

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!content.trim()) {
      setError(t('microblog.composer.error.empty'))
      return
    }

    if (content.length > MAX_CHARACTERS) {
      setError(t('microblog.composer.error.tooLong'))
      return
    }

    if (showContentWarning && !contentWarning.trim()) {
      setError(t('microblog.composer.error.cwRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const requestBody: {
        content: string
        visibility?: string
        is_sensitive?: boolean
        content_warning?: string
      } = {
        content: content.trim(),
        visibility: visibility,
      }

      if (showContentWarning && contentWarning.trim()) {
        requestBody.is_sensitive = true
        requestBody.content_warning = contentWarning.trim()
      } else if (!showContentWarning) {
        requestBody.is_sensitive = false
      }

      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.createPost), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = t('microblog.composer.error.submitFailed')

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch {
            // If JSON parsing fails, use default message
          }
        }

        throw new Error(errorMessage)
      }

      // Reset form
      setContent('')
      setContentWarning('')
      setShowContentWarning(false)
      setVisibility('public')
      setError(null)

      // Notify parent component
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err) {
      console.error('Error creating post:', err)
      setError(err instanceof Error ? err.message : t('microblog.composer.error.submitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="post-composer">
      <div className="post-composer-header">
        <h3>{t('microblog.composer.title')}</h3>
      </div>

      {error && (
        <div className="post-composer-error" role="alert">
          {error}
        </div>
      )}

      <div className="post-composer-content">
        <textarea
          ref={textareaRef}
          className="post-composer-textarea"
          placeholder={t('microblog.composer.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_CHARACTERS}
          rows={4}
          disabled={isSubmitting}
        />

        <div className="post-composer-footer">
          <div className="post-composer-char-count">
            <span className={remainingCharacters < 20 ? 'warning' : ''}>
              {remainingCharacters}
            </span>
            <span className="separator">/</span>
            <span>{MAX_CHARACTERS}</span>
          </div>
        </div>
      </div>

      <div className="post-composer-options">
        <label className="post-composer-cw-toggle">
          <input
            type="checkbox"
            checked={showContentWarning}
            onChange={(e) => setShowContentWarning(e.target.checked)}
            disabled={isSubmitting}
          />
          <span>{t('microblog.composer.contentWarning')}</span>
        </label>

        {showContentWarning && (
          <input
            type="text"
            className="post-composer-cw-input"
            placeholder={t('microblog.composer.cwPlaceholder')}
            value={contentWarning}
            onChange={(e) => setContentWarning(e.target.value)}
            disabled={isSubmitting}
          />
        )}

        <div className="post-composer-visibility">
          <label htmlFor="visibility-select">{t('microblog.composer.visibility')}</label>
          <select
            id="visibility-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            disabled={isSubmitting}
          >
            <option value="public">{t('microblog.composer.visibilityOptions.public')}</option>
            <option value="unlisted">{t('microblog.composer.visibilityOptions.unlisted')}</option>
            <option value="followers">{t('microblog.composer.visibilityOptions.followers')}</option>
            <option value="private">{t('microblog.composer.visibilityOptions.private')}</option>
          </select>
        </div>
      </div>

      <div className="post-composer-actions">
        <button
          className="post-composer-submit"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || content.length > MAX_CHARACTERS}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              {t('microblog.composer.submitting')}
            </>
          ) : (
            t('microblog.composer.submit')
          )}
        </button>
        <span className="post-composer-shortcut">
          {t('microblog.composer.shortcut')}
        </span>
      </div>
    </div>
  )
}
