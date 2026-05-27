import styles from './SegmentedToggle.module.css'

export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className={styles.toggle}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          aria-selected={value === opt.value}
          className={`${styles.segment} ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
