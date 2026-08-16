import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

/**
 * Renders a router `Link` for in-app destinations (`/privacy`, `/#emi`) and a
 * plain anchor for everything else (`tel:`, `mailto:`, `https://`, bare `#id`).
 */
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
