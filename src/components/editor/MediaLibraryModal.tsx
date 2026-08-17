import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, Upload, X } from 'react-feather'

import mediaService, {
  MEDIA_LIMITS,
  validateFile,
  type MediaItem,
  type MediaType,
} from '../../services/mediaService'
import styles from './MediaLibraryModal.module.css'

export interface MediaInsertDetails {
  altText: string
  caption: string
}

export interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  /** Restricts both tabs to one kind of media. */
  accept: MediaType
  onSelect: (item: MediaItem, details: MediaInsertDetails) => void
}

type Tab = 'upload' | 'library'

const PAGE_SIZE = 24

export function MediaLibraryModal({ isOpen, onClose, accept, onSelect }: MediaLibraryModalProps) {
  const { t } = useTranslation()

  const [tab, setTab] = useState<Tab>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [decorative, setDecorative] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await mediaService.list({
        media_type: accept,
        q: query || undefined,
        limit: PAGE_SIZE,
      })
      setItems(response.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [accept, query])

  useEffect(() => {
    if (!isOpen) return
    void loadLibrary()
  }, [isOpen, loadLibrary])

  // Reset between openings, so a previous selection does not leak into the next
  // insertion.
  useEffect(() => {
    if (isOpen) return
    setSelected(null)
    setAltText('')
    setCaption('')
    setDecorative(false)
    setError(null)
    setProgress(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    const validation = validateFile(file, accept)
    if (!validation.ok) {
      setError(
        validation.reason === 'size'
          ? t('editor.media.tooLarge', 'That file is larger than {{mb}} MB.', {
              mb: Math.round((validation.limitBytes ?? 0) / 1024 / 1024),
            })
          : t('editor.media.unsupportedType', 'That file type is not supported.'),
      )
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const item = await mediaService.upload(file, {
        onProgress: ({ percent }) => setProgress(percent),
      })
      // Straight into the selection: uploading something is choosing it.
      setItems((current) => [item, ...current])
      setSelected(item)
      setTab('library')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUploading(false)
    }
  }

  const insert = () => {
    if (!selected) return

    onSelect(selected, {
      altText: decorative ? '' : altText.trim(),
      caption: caption.trim(),
    })
    onClose()
  }

  if (!isOpen) return null

  const needsAltText = accept === 'image' && !decorative && altText.trim() === ''
  const maxMb = Math.round(MEDIA_LIMITS[accept].maxBytes / 1024 / 1024)

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t('editor.media.title', 'Media library')}
      >
        <header className={styles.header}>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'library'}
              className={tab === 'library' ? styles.tabActive : styles.tab}
              onClick={() => setTab('library')}
            >
              {t('editor.media.tabLibrary', 'Library')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'upload'}
              className={tab === 'upload' ? styles.tabActive : styles.tab}
              onClick={() => setTab('upload')}
            >
              {t('editor.media.tabUpload', 'Upload')}
            </button>
          </div>

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('editor.media.close', 'Close')}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.main}>
            {tab === 'library' ? (
              <>
                <input
                  type="search"
                  className={styles.search}
                  placeholder={t('editor.media.searchPlaceholder', 'Search by name or alt text')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />

                {loading && <p className={styles.notice}>{t('editor.media.loading', 'Loading…')}</p>}

                {!loading && items.length === 0 && (
                  <p className={styles.notice}>
                    {t('editor.media.empty', 'Nothing here yet. Upload something to begin.')}
                  </p>
                )}

                <ul className={styles.grid}>
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={selected?.id === item.id ? styles.cardSelected : styles.card}
                        onClick={() => {
                          setSelected(item)
                          setAltText(item.alt_text ?? '')
                        }}
                        aria-pressed={selected?.id === item.id}
                      >
                        {item.url && item.media_type === 'image' ? (
                          <img src={item.thumbnail_url ?? item.url} alt="" loading="lazy" />
                        ) : (
                          <span className={styles.cardIcon}>
                            <ImageIcon size={22} />
                          </span>
                        )}
                        <span className={styles.cardName}>
                          {item.original_filename ?? item.title ?? item.id}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div
                className={styles.dropzone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  void handleFiles(event.dataTransfer.files)
                }}
              >
                <Upload size={28} />
                <p>{t('editor.media.dropHint', 'Drop a file here, or choose one.')}</p>
                <p className={styles.hint}>
                  {t('editor.media.limitHint', 'Up to {{mb}} MB.', { mb: maxMb })}
                </p>

                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading
                    ? t('editor.media.uploading', 'Uploading… {{percent}}%', { percent: progress })
                    : t('editor.media.browse', 'Choose a file')}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.fileInput}
                  accept={MEDIA_LIMITS[accept].mimeTypes.join(',')}
                  onChange={(event) => void handleFiles(event.target.files)}
                />
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
          </div>

          <aside className={styles.details}>
            <h3 className={styles.detailsTitle}>{t('editor.media.details', 'Details')}</h3>

            {selected ? (
              <>
                {accept === 'image' && (
                  <>
                    <label className={styles.label} htmlFor="fa-media-alt">
                      {t('editor.media.altLabel', 'Alt text')}
                    </label>
                    <textarea
                      id="fa-media-alt"
                      className={styles.input}
                      rows={3}
                      value={altText}
                      disabled={decorative}
                      onChange={(event) => setAltText(event.target.value)}
                    />

                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={decorative}
                        onChange={(event) => setDecorative(event.target.checked)}
                      />
                      {t('editor.media.decorative', 'Decorative, needs no description')}
                    </label>
                  </>
                )}

                <label className={styles.label} htmlFor="fa-media-caption">
                  {t('editor.media.captionLabel', 'Caption')}
                </label>
                <input
                  id="fa-media-caption"
                  className={styles.input}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                />

                {needsAltText && (
                  <p className={styles.hint}>
                    {t(
                      'editor.media.altRequired',
                      'Describe the image, or mark it decorative, so it works for readers who cannot see it.',
                    )}
                  </p>
                )}
              </>
            ) : (
              <p className={styles.notice}>
                {t('editor.media.nothingSelected', 'Choose something to insert.')}
              </p>
            )}
          </aside>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            {t('editor.media.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={insert}
            disabled={!selected || needsAltText}
          >
            {t('editor.media.insert', 'Insert')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default MediaLibraryModal
