import styles from './Stat.module.css'

interface StatProps {
  value: string
  label: string
}

/** Serif figure over a muted caption — the trust row under the hero. */
export function Stat({ value, label }: StatProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}
