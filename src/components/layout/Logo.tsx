import { cx } from '../../lib/cx'
import { site } from '../../data/site'
import logoUrl from '../../assets/loinance-logo.png'
import styles from './Logo.module.css'

interface LogoProps {
  /** `dark` sits the mark on a light plate so it reads on the ink footer. */
  tone?: 'light' | 'dark'
  className?: string
}

export function Logo({ tone = 'light', className }: LogoProps) {
  return (
    <span className={cx(styles.logo, styles[tone], className)}>
      <img
        className={styles.image}
        src={logoUrl}
        alt={site.legalName}
        width={210}
        height={74}
      />
    </span>
  )
}
