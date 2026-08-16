import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  title: ReactNode
  /** Right-aligned note that sits on the heading's baseline. */
  aside?: ReactNode
  /** Paragraph below the heading. */
  description?: ReactNode
  className?: string
}

export function SectionHeading({
  title,
  aside,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cx(styles.heading, className)}>
      <div className={styles.row}>
        <h2 className={styles.title}>{title}</h2>
        {aside && <p className={styles.aside}>{aside}</p>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  )
}
