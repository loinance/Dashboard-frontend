import { ApplicationForm } from './ApplicationForm'
import { Button } from '../ui/Button'
import { Eyebrow } from '../ui/Eyebrow'
import { Stat } from '../ui/Stat'
import { StatusDot } from '../ui/StatusDot'
import { heroStats, site } from '../../data/site'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.copy}>
        <Eyebrow tone="green" badge>
          {site.partnerCount} BANKS &amp; NBFCS · {site.city.toUpperCase()} SINCE{' '}
          {site.since}
        </Eyebrow>

        {/* The line breaks are decorative and hidden below 900px, so each one
            is followed by a real space — without it the words run together on
            mobile ("application.Every"). */}
        <h1 className={styles.title}>
          One application.
          <br />{' '}
          <em className={styles.accent}>Every bank</em> competing
          <br />{' '}
          for your loan.
        </h1>

        <p className={styles.lede}>
          Tell us what you need once. We take it to HDFC, SBI, Kotak, Axis and
          eleven others, then walk you through the paperwork until the money
          lands.
        </p>

        <div className={styles.ctas}>
          <Button href="#apply">Check my eligibility</Button>
          <Button
            href={site.whatsapp}
            variant="outline"
            target="_blank"
            rel="noreferrer"
          >
            <StatusDot />
            WhatsApp us now
          </Button>
        </div>

        <div className={styles.stats}>
          {heroStats.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>

      <ApplicationForm />
    </section>
  )
}
