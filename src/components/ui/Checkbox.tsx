import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Checkbox.module.css'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode
}

/**
 * Never render this pre-ticked — DPDP consent has to be a clear affirmative
 * action by the person.
 */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  const id = useId()

  return (
    <div className={cx(styles.row, className)}>
      <input id={id} type="checkbox" className={styles.input} {...rest} />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  )
}
