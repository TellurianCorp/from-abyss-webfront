import { ReactNode } from 'react'
import styles from './WidgetCard.module.css'

interface WidgetCardProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function WidgetCard({ title, icon, action, children, className = '' }: WidgetCardProps) {
  return (
    <div className={`${styles.widgetCard} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
