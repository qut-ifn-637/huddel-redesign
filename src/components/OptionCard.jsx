import styles from './OptionCard.module.css'

export default function OptionCard({ label, selected, onSelect }) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}
