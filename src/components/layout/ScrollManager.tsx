import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * The router keeps the scroll position across navigations, which is wrong for
 * a page change and wrong for a `/#section` link arriving from another route.
 * This restores both behaviours.
 */
export function ScrollManager() {
  // `key` is new on every navigation, including one to the URL we are already
  // on. Without it, clicking a second link with the same target does nothing —
  // pathname and hash are unchanged, so the effect never re-runs.
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, key])

  return null
}
