import type { LeadStats as LeadStatsShape } from '../../data/leads'
import styles from './LeadStats.module.css'

interface LeadStatsProps {
  stats: LeadStatsShape | null
}

/**
 * §8.3 counts for the dashboard header. These respect the active filters, so
 * they answer "how many of *these*", not "how many altogether".
 */
export function LeadStats({ stats }: LeadStatsProps) {
  const tiles = [
    { label: 'Matching', value: stats?.total },
    { label: 'Today', value: stats?.today },
    { label: 'This week', value: stats?.thisWeek },
    { label: 'This month', value: stats?.thisMonth },
    { label: 'Flagged', value: stats?.suspect, muted: true },
  ]

  return (
    <div className={styles.grid}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <span className={styles.label}>{tile.label}</span>
          <span className={tile.muted ? styles.valueMuted : styles.value}>
            {/* An em dash while loading, never a flash of zero — a real zero and
                "not known yet" must not look the same. */}
            {tile.value === undefined ? '—' : tile.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  )
}
