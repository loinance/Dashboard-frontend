import { announcement } from '../../data/site'
import styles from './AnnouncementBar.module.css'

export function AnnouncementBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.text}>{announcement.text}</span>
      <a
        className={styles.cta}
        href={announcement.ctaHref}
        target="_blank"
        rel="noreferrer"
      >
        {announcement.ctaLabel}
      </a>
    </div>
  )
}
