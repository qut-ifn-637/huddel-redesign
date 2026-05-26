import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import styles from './GoalActions.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']
const OUTCOME_CHIPS = ['Finish a chapter', 'Submit a draft']

let nextId = 100 // simple incrementing ID for new actions

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)
  const [actions, setActions] = useState(state.actions)
  const [activeTab, setActiveTab] = useState('effort')
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  function addAction(label, source) {
    const newAction = { id: `act-${nextId++}`, label, source, completed: false }
    setActions(prev => [...prev, newAction])
  }

  function removeAction(id) {
    setActions(prev => prev.filter(a => a.id !== id))
  }

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) {
      addAction(customInput.trim(), 'custom')
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  function handleNext() {
    updateState({ goalName, actions })
    goTo('cadence')
  }

  const chips = activeTab === 'effort' ? EFFORT_CHIPS : OUTCOME_CHIPS
  const canAdvance = goalName.trim().length > 0 && actions.length > 0

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>What are you working toward?</h1>

      <input
        className={styles.goalInput}
        type="text"
        placeholder="e.g. Finish my essay"
        value={goalName}
        onChange={e => setGoalName(e.target.value)}
      />

      <p className={styles.sectionLabel}>Break it into actions you can actually do</p>
      <p className={styles.helper}>
        Small efforts add up — describe each one by what you&apos;ll do, not the finish line.
      </p>

      <div className={styles.tabs}>
        {['effort', 'outcome'].map(tab => (
          <button
            key={tab}
            type="button"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'effort' ? 'By effort' : 'By outcome'}
          </button>
        ))}
      </div>

      <div className={styles.chips}>
        {chips.map(chip => (
          <button
            key={chip}
            type="button"
            className={styles.chip}
            onClick={() => addAction(chip, activeTab)}
          >
            {chip}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${styles.chipCustom}`}
          onClick={() => setShowCustomInput(true)}
        >
          + Write my own
        </button>
      </div>

      {showCustomInput && (
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

      {actions.length > 0 && (
        <ul className={styles.actionList}>
          {actions.map(action => (
            <li key={action.id} className={styles.actionItem}>
              <span>{action.label}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeAction(action.id)}
                aria-label={`Remove ${action.label}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
