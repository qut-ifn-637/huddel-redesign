import { useState } from 'react'
import styles from './StepCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

export default function StepCard({ step, position, expanded, onToggle, onRename, onAddAction, onRemoveAction }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const displayName = step.name.trim() || `Step ${position}`
  const count = step.actions.length

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) {
      onAddAction(customInput.trim(), 'custom')
      setCustomInput('')
      setShowCustom(false)
    }
  }

  return (
    <div className={styles.card}>
      <button type="button" className={styles.header} aria-expanded={expanded} onClick={onToggle}>
        <span className={styles.headerName}>{displayName}</span>
        <span className={styles.headerMeta}>
          {expanded ? '▾' : `${count} action${count !== 1 ? 's' : ''} ▸`}
        </span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Name this step (optional)"
            value={step.name}
            onChange={e => onRename(e.target.value)}
          />

          {count > 0 && (
            <ul className={styles.actionList}>
              {step.actions.map(action => (
                <li key={action.id} className={styles.actionItem}>
                  <span>{action.label}</span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemoveAction(action.id)}
                    aria-label={`Remove ${action.label}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.addLabel}>Add an effort-based action</p>
          <div className={styles.chips}>
            {EFFORT_CHIPS.map(chip => (
              <button key={chip} type="button" className={styles.chip} onClick={() => onAddAction(chip, 'effort')}>
                {chip}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.chip} ${styles.chipCustom}`}
              onClick={() => setShowCustom(true)}
            >
              + Write my own
            </button>
          </div>

          {showCustom && (
            <form className={styles.customForm} onSubmit={handleCustomSubmit}>
              <input
                autoFocus
                className={styles.customInput}
                type="text"
                placeholder="Describe your action…"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
              />
              <button type="submit" className={styles.customAdd}>Add</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
