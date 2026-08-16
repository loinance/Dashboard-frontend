import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Eyebrow } from '../ui/Eyebrow'
import { Section } from '../layout/Section'
import { StatusDot } from '../ui/StatusDot'
import { site } from '../../data/site'
import whatsappQr from '../../assets/whatsapp-icon.png'
import styles from './ContactCta.module.css'

export function ContactCta() {
  return (
    <Section id="contact" ariaLabel="Contact" className={styles.section}>
      <div className={styles.grid}>
        <Card tone="green" className={styles.talk}>
          <h2 className={styles.title}>Rather just talk to a person?</h2>
          <p className={styles.lede}>
            Send us a message on WhatsApp with what you need. You'll get a
            straight answer on whether it's fundable — usually within the hour,{' '}
            {site.hours}.
          </p>

          <div className={styles.ctas}>
            <Button
              href={site.whatsapp}
              variant="paper"
              target="_blank"
              rel="noreferrer"
            >
              <StatusDot />
              Chat on WhatsApp
            </Button>
            <Button href={site.phoneHref} variant="outlineOnGreen">
              Call {site.phone}
            </Button>
          </div>

          <div className={styles.details}>
            <div>
              <Eyebrow tone="onGreen">EMAIL</Eyebrow>
              <a className={styles.email} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
            <div>
              <Eyebrow tone="onGreen">OFFICE</Eyebrow>
              <p className={styles.address}>{site.address}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.qr}>
          <img
            className={styles.qrCode}
            src={whatsappQr}
            alt={`QR code that opens a WhatsApp chat with ${site.legalName}`}
            width={150}
            height={150}
          />
          <div>
            <h3 className={styles.qrTitle}>Scan to start a chat</h3>
            <p className={styles.qrBody}>
              Or save the number and message us any time — we reply on WhatsApp
              first.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}
