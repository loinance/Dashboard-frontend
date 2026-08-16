import { site } from '../../data/site'
import type { PageSeo } from '../../data/seo'

/**
 * Per-page metadata. React 19 hoists `title`, `meta` and `link` out of the
 * component tree and into `<head>`, so no helmet library is needed.
 *
 * Note these tags are written by JavaScript. Crawlers that don't execute JS —
 * WhatsApp, Facebook and LinkedIn link previews among them — will only ever
 * see the fallbacks in `index.html` until the site is pre-rendered.
 */
export function Seo({ title, description, path, noIndex }: PageSeo) {
  const url = `${site.url}${path === '/' ? '' : path}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.legalName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  )
}
