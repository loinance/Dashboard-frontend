import styles from './StatusDot.module.css'

/** The small green presence dot next to WhatsApp calls-to-action. */
export function StatusDot() {
  return <span aria-hidden="true" className={styles.dot} />
}
