import styles from './BackButton.module.css'

export default function BackButton({ onClick }) {
  return (
    <button type="button" className={styles.back} onClick={onClick} aria-label="Go back">
      ← Back
    </button>
  )
}
