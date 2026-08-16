import { useState } from 'react'
import { Button } from '../ui/Button'
import { SmartLink } from '../ui/SmartLink'
import { Logo } from './Logo'
import { primaryNav, site } from '../../data/site'
import { cx } from '../../lib/cx'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brand}>
          <SmartLink href="/" className={styles.logoLink}>
            <Logo />
          </SmartLink>
          <nav className={styles.nav} aria-label="Primary">
            {primaryNav.map((link) => (
              <SmartLink
                key={link.label}
                className={styles.navLink}
                href={link.href}
              >
                {link.label}
              </SmartLink>
            ))}
          </nav>
        </div>

        <div className={styles.actions}>
          <a className={styles.phone} href={site.phoneHref}>
            {site.phone}
          </a>
          <Button href="#apply" size="sm">
            Apply in 2 minutes
          </Button>
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="srOnly">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
            <span aria-hidden="true" className={cx(styles.bars, menuOpen && styles.barsOpen)} />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={cx(styles.mobileNav, menuOpen && styles.mobileNavOpen)}
        hidden={!menuOpen}
      >
        {primaryNav.map((link) => (
          <SmartLink
            key={link.label}
            className={styles.mobileLink}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </SmartLink>
        ))}
        <a className={styles.mobileLink} href={site.phoneHref}>
          {site.phone}
        </a>
      </nav>
    </header>
  )
}
