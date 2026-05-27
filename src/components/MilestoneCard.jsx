import { useState } from 'react'
import styles from './MilestoneCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

export default function MilestoneCard({ milestone, expanded, onToggle, onRename, onAddAction, onRemoveAction, onSetKind }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

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
      <div className={styles.header}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Name this milestone"
          value={milestone.name}
          onChange={e => onRename(e.target.value)}
          aria-label="Milestone name"
        />
        <button
          type="button"
          className={styles.caret}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide actions' : 'Show actions'}
          onClick={onToggle}
        >
          {expanded ? '▾' : '▸'}
        </button>
      </div>

      {expanded && (
        <div className={styles.body}>
          {milestone.actions.length > 0 && (
            <ul className={styles.actionList}>
              {milestone.actions.map(action => {
                const isOnce = action.kind === 'once'
                return (
                  <li key={action.id} className={styles.actionItem}>
                    <div className={styles.actionTop}>
                      <span className={styles.actionLabel}>{action.label}</span>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => onRemoveAction(action.id)}
                        aria-label={`Remove ${action.label}`}
                      >
                        ×
                      </button>
                    </div>
                    <div
                      className={styles.segmented}
                      role="group"
                      aria-label={`How often will you do this: ${action.label}`}
                    >
                      <button
                        type="button"
                        className={`${styles.segment} ${!isOnce ? styles.segmentActive : ''}`}
                        aria-pressed={!isOnce}
                        onClick={() => onSetKind(action.id, 'repeat')}
                      >
                        Repeats
                      </button>
                      <button
                        type="button"
                        className={`${styles.segment} ${isOnce ? styles.segmentActive : ''}`}
                        aria-pressed={isOnce}
                        onClick={() => onSetKind(action.id, 'once')}
                      >
                        Just once
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <p className={styles.addLabel}>Add an effort-based action</p>
          <p className="scienceNote">Describe what you&apos;ll do, not the finish line. — Pham &amp; Taylor, 1999</p>
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
              <textarea
                autoFocus
                rows={1}
                className={styles.customInput}
                placeholder="Describe your action…"
                value={customInput}
                onChange={e => {
                  setCustomInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
              />
              <button type="submit" className={styles.customAdd}>Add</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
