import { Card } from '../ui/Card'
import { Hatch } from '../ui/Hatch'
import { Section } from '../layout/Section'
import { testimonials } from '../../data/testimonials'
import styles from './Testimonials.module.css'

export function Testimonials() {
  return (
    <Section ariaLabel="What clients say">
      <ul className={styles.grid}>
        {testimonials.map((item) => (
          <li key={item.id}>
            <Card className={styles.card}>
              <figure className={styles.figure}>
                <blockquote className={styles.quote}>
                  “{item.quote}”
                </blockquote>
                <figcaption className={styles.person}>
                  {item.avatar ? (
                    <img
                      className={styles.avatar}
                      src={item.avatar}
                      alt=""
                      width={34}
                      height={34}
                    />
                  ) : (
                    <Hatch size={34} circle />
                  )}
                  <span>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.product}>{item.product}</span>
                  </span>
                </figcaption>
              </figure>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  )
}
