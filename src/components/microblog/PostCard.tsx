import { ReactNode } from 'react'
import styles from './PostCard.module.css'

interface PostCardProps {
  children: ReactNode
  highlighted?: boolean
  className?: string
}

export function PostCard({ children, highlighted = false, className = '' }: PostCardProps) {
  return (
    <article
      className={`${styles.postCard} ${highlighted ? styles.highlighted : ''} ${className}`}
      role="article"
    >
      {children}
    </article>
  )
}
