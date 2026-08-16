import type { ReactNode } from 'react'
import { Eyebrow } from '../ui/Eyebrow'
import { Section } from './Section'
import { Seo } from '../seo/Seo'
import { legal } from '../../data/site'
import type { PageSeo } from '../../data/seo'
import styles from './LegalPage.module.css'

interface LegalPageProps {
  title: string
  seo: PageSeo
  /** One-paragraph summary in plain language, above the formal text. */
  summary: ReactNode
  children: ReactNode
}

/** Shared reading layout for the policy pages. */
export function LegalPage({ title, seo, summary, children }: LegalPageProps) {
  return (
    <Section className={styles.section}>
      <Seo {...seo} />
      <article className={styles.page}>
        <header className={styles.header}>
          <Eyebrow tone="green">LAST UPDATED {legal.lastUpdated.toUpperCase()}</Eyebrow>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.summary}>{summary}</p>
        </header>

        <div className={styles.prose}>{children}</div>
      </article>
    </Section>
  )
}
