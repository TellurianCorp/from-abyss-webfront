import styles from './MediaGallery.module.css'

interface MediaGalleryProps {
  mediaUrls: string[]
}

export function MediaGallery({ mediaUrls }: MediaGalleryProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null
  }

  const gridClass = mediaUrls.length === 1 ? styles.single :
                    mediaUrls.length === 2 ? styles.double :
                    mediaUrls.length === 3 ? styles.triple :
                    styles.quad

  return (
    <div className={`${styles.mediaGallery} ${gridClass}`}>
      {mediaUrls.map((url, index) => (
        <div key={index} className={styles.mediaItem}>
          <img
            src={url}
            alt={`Media ${index + 1}`}
            className={styles.media}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
