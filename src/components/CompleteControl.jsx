import styles from './CompleteControl.module.css'

export default function CompleteControl({ actionId, label, count, repeatable, onComplete, onUndo }) {
  const done = count > 0

  function handlePrimary() {
    if (repeatable) onComplete(actionId)
    else if (done) onUndo(actionId)
    else onComplete(actionId)
  }

  const ariaLabel = done
    ? `${label} — done${repeatable ? `, ${count} times` : ''}`
    : `Mark done: ${label}`

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.main}
        onClick={handlePrimary}
        role="button"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePrimary() } }}
      >
        <div
          data-testid="complete-circle"
          className={`${styles.circle} ${done ? styles.completed : ''}`}
        >
          {done && (
            <svg viewBox="0 0 24 24" className={styles.check} aria-hidden="true">
              <polyline points="4,13 9,18 20,6" />
            </svg>
          )}
        </div>
        <span className={`${styles.label} ${done && !repeatable ? styles.labelDone : ''}`}>
          {label}
        </span>
        {repeatable && done && <span className={styles.count}>done {count}×</span>}
      </div>
      {repeatable && done && (
        <button
          type="button"
          className={styles.undo}
          onClick={() => onUndo(actionId)}
          aria-label="Undo one"
        >
          −
        </button>
      )}
    </div>
  )
}
