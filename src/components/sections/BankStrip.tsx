import { Card } from '../ui/Card'
import { Eyebrow } from '../ui/Eyebrow'
import { Section } from '../layout/Section'
import { Tag } from '../ui/Tag'
import { banks } from '../../data/banks'
import { site } from '../../data/site'
import styles from './BankStrip.module.css'

export function BankStrip() {
  return (
    <Section id="banks" ariaLabel="Partner banks" className={styles.section}>
      <Card className={styles.card}>
        <div className={styles.head}>
          <Eyebrow>WE PLACE FILES WITH</Eyebrow>
          <span className={styles.count}>{site.partnerCount} lending partners</span>
        </div>

        <ul className={styles.list}>
          {banks.map((bank) => (
            <li key={bank}>
              <Tag>{bank}</Tag>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  )
}
