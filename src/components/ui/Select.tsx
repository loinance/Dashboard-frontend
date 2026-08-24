import type { SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[]
  /** Shown as the first, empty-valued option — the "no filter" choice. */
  placeholder?: string
}

/**
 * A native `<select>`, styled to match `TextInput`.
 *
 * Native on purpose: it gets keyboard behaviour, mobile pickers and screen
 * reader support for free, none of which a div-based menu would earn back.
 */
export function Select({ options, placeholder, className, ...rest }: SelectProps) {
  return (
    <div className={cx(styles.box, className)}>
      <select className={styles.select} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.chevron} aria-hidden="true" />
    </div>
  )
}
