import { Button } from '../components/ui/Button'
import { Section } from '../components/layout/Section'
import { Seo } from '../components/seo/Seo'
import { pageSeo } from '../data/seo'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <Section className={styles.section}>
      <Seo {...pageSeo.notFound} />
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>That page has moved on.</h1>
      <p className={styles.body}>
        The link you followed doesn't lead anywhere. Start from the top, or tell
        us what you were looking for.
      </p>
      <div className={styles.actions}>
        <Button href="/">Back to home</Button>
        <Button href="/#contact" variant="outline">
          Contact us
        </Button>
      </div>
    </Section>
  )
}
