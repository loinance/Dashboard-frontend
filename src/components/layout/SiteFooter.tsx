import { Eyebrow } from '../ui/Eyebrow'
import { SmartLink } from '../ui/SmartLink'
import { Logo } from './Logo'
import { footerColumns, site } from '../../data/site'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Logo tone="dark" />
          <p className={styles.blurb}>
            An independent loan distributor working with {site.partnerCount}{' '}
            banks and NBFCs across India. We are not a lender.
          </p>
        </div>

        {footerColumns.map((column) => (
          <nav
            key={column.title}
            className={styles.column}
            aria-label={column.title}
          >
            <Eyebrow tone="onDark" className={styles.columnTitle}>
              {column.title.toUpperCase()}
            </Eyebrow>
            {column.links.map((link) => (
              <SmartLink
                key={link.label}
                className={styles.link}
                href={link.href}
              >
                {link.label}
              </SmartLink>
            ))}
          </nav>
        ))}
      </div>

      <div className={styles.legal}>
        <span>{site.copyright}</span>
        <span>{site.disclaimer}</span>
      </div>
    </footer>
  )
}
