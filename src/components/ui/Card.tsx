import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Card.module.css'

export type CardTone = 'surface' | 'ink' | 'green'

interface CardProps {
  tone?: CardTone
  /** Turns the card into a link and adds hover lift. */
  href?: string
  /** Extra shadow — the application panel in the hero. */
  raised?: boolean
  className?: string
  children: ReactNode
}

/** The rounded panel every section is built out of. */
export function Card({
  tone = 'surface',
  href,
  raised = false,
  className,
  children,
  ...rest
}: CardProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cx(
    styles.base,
    styles[tone],
    raised && styles.raised,
    href && styles.link,
    className,
  )

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <div className={classes} {...(rest as { id?: string })}>
      {children}
    </div>
  )
}
