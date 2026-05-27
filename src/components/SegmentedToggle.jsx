import styles from './SegmentedToggle.module.css'

export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className={styles.toggle} role="tablist">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="tab"
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
