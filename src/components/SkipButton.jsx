import styles from './SkipButton.module.css'

export default function SkipButton({ children, onClick }) {
  return (
    <button type="button" className={styles.btn} onClick={onClick}>
      {children}
    </button>
  )
}
