import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Section.module.css'

interface SectionProps {
  /** Anchor target for the nav — also gets scroll-margin for the sticky header. */
  id?: string
  /** Accessible name; falls back to the visible heading inside. */
  ariaLabel?: string
  className?: string
  children: ReactNode
}

/** Page-level band: applies the shared gutter and bottom rhythm. */
export function Section({ id, ariaLabel, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cx(styles.section, className)}
    >
      {children}
    </section>
  )
}
