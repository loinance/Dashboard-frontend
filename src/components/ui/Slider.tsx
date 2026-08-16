import { useId } from 'react'
import styles from './Slider.module.css'

interface SliderProps {
  label: string
  /** Large formatted read-out shown opposite the label. */
  display: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
}

/** Labelled range control used by the EMI calculator. */
export function Slider({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
}: SliderProps) {
  const id = useId()

  return (
    <div className={styles.slider}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <output className={styles.value} htmlFor={id}>
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={styles.bounds}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
