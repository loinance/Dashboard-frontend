/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin. Empty in development — the dev server proxies `/api`. */
  readonly VITE_API_BASE_URL?: string
  /** Cloudflare Turnstile site key. Public by design. */
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
