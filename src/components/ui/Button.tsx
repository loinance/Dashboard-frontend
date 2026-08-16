import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cx } from '../../lib/cx'
import { SmartLink } from './SmartLink'
import styles from './Button.module.css'

export type ButtonVariant =
  | 'solid'
  | 'outline'
  | 'green'
  | 'mint'
  | 'paper'
  | 'outlineOnGreen'

export type ButtonSize = 'sm' | 'md' | 'block'

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type LinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

type ActionProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }

export type ButtonProps = LinkProps | ActionProps

/**
 * One button, two elements: renders an <a> when given `href`, a <button>
 * otherwise. Every CTA on the site goes through here.
 */
export function Button({
  variant = 'solid',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: ButtonProps) {
  const classes = cx(styles.base, styles[variant], styles[size], className)

  if (href !== undefined) {
    return (
      <SmartLink
        className={classes}
        href={href}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </SmartLink>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
