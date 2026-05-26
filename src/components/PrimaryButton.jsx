import styles from './PrimaryButton.module.css'

export default function PrimaryButton({ children, onClick, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={styles.btn}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
