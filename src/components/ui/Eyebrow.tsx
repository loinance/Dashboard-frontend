import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Eyebrow.module.css'

export type EyebrowTone = 'green' | 'muted' | 'mint' | 'onDark' | 'onGreen'

interface EyebrowProps {
  tone?: EyebrowTone
  /** Pill-shaped tinted background — used for the hero badge. */
  badge?: boolean
  className?: string
  children: ReactNode
}

/** Small monospaced label that sits above headings and section titles. */
export function Eyebrow({
  tone = 'muted',
  badge = false,
  className,
  children,
}: EyebrowProps) {
  return (
    <span
      className={cx(styles.base, styles[tone], badge && styles.badge, className)}
    >
      {children}
    </span>
  )
}
