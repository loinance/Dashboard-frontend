import { cx } from '../../lib/cx'
import styles from './Hatch.module.css'

interface HatchProps {
  /** Square edge length in px. */
  size?: number
  radius?: number
  /** Placeholder caption, e.g. "icon" or "whatsapp QR". */
  label?: string
  tone?: 'light' | 'dark'
  circle?: boolean
  className?: string
}

/**
 * Diagonal-hatch placeholder standing in for artwork that hasn't shipped yet
 * (product icons, avatars, the WhatsApp QR). Swap for an <img> as assets land.
 */
export function Hatch({
  size = 36,
  radius = 9,
  label,
  tone = 'light',
  circle = false,
  className,
}: HatchProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.hatch, styles[tone], className)}
      style={{
        width: size,
        height: size,
        borderRadius: circle ? '50%' : radius,
      }}
    >
      {label}
    </span>
  )
}
