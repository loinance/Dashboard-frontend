import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Field.module.css'

interface FieldProps {
  label: string
  /** Receives the generated id so the control can be labelled. */
  children: (id: string) => ReactNode
  /** Server-side message for this field. Renders below the control. */
  error?: string
  className?: string
}

/** Uppercase micro-label above a control. */
export function Field({ label, children, error, className }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={cx(styles.field, error && styles.invalid, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface FieldGroupProps {
  label: string
  children: ReactNode
  className?: string
}

/**
 * Same label treatment as `Field`, but for controls that can't be targeted by
 * a <label> — a radiogroup of chips, for instance.
 */
export function FieldGroup({ label, children, className }: FieldGroupProps) {
  return (
    <div className={cx(styles.field, className)}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the box, before the value — e.g. "₹". */
  prefix?: string
}

export function TextInput({ prefix, className, ...rest }: TextInputProps) {
  return (
    <div className={cx(styles.box, className)}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <input className={styles.input} {...rest} />
    </div>
  )
}
