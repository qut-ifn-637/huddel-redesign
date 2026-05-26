import styles from './CompleteControl.module.css'

export default function CompleteControl({ actionId, label, completed, onComplete }) {
  function handleClick() {
    if (!completed) onComplete(actionId)
  }

  return (
    <div
      className={`${styles.wrapper} ${completed ? styles.wrapperDone : ''}`}
      onClick={handleClick}
      role="button"
      aria-label={completed ? `${label} — completed` : `Mark complete: ${label}`}
      tabIndex={completed ? -1 : 0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
    >
      <div
        data-testid="complete-circle"
        className={`${styles.circle} ${completed ? styles.completed : ''}`}
      >
        {completed && (
          <svg
            viewBox="0 0 24 24"
            className={styles.check}
            aria-hidden="true"
          >
            <polyline points="4,13 9,18 20,6" />
          </svg>
        )}
      </div>
      <span className={`${styles.label} ${completed ? styles.labelDone : ''}`}>
        {label}
      </span>
    </div>
  )
}
