import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { cx } from '../../lib/cx'
import styles from './ChipGroup.module.css'

export interface ChipOption<T extends string = string> {
  value: T
  label: string
}

interface ChipGroupProps<T extends string> {
  /** Accessible name for the group — usually the visible field label. */
  label: string
  options: ChipOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * Pill-shaped single-select. Exposed as a real radiogroup, so arrow keys move
 * the selection and screen readers announce it as a set of choices.
 */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: ChipGroupProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!forward && !back) return

    event.preventDefault()
    const current = options.findIndex((option) => option.value === value)
    const nextIndex =
      (current + (forward ? 1 : -1) + options.length) % options.length

    onChange(options[nextIndex].value)
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [nextIndex]?.focus()
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      className={cx(styles.group, className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.chip, selected && styles.selected)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
