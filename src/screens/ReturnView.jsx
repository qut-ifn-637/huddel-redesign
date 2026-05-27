import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [steps, setSteps] = useState(state.steps)

  const flat = allActions(steps)
  const completedCount = flat.filter(a => a.completed).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = steps.map(s => ({
      ...s,
      actions: s.actions.map(a => (a.id === actionId ? { ...a, completed: true } : a)),
    }))
    setSteps(updated)
    updateState({ steps: updated })
  }

  const showHeaders = steps.length > 1 || steps.some(s => s.name.trim())
  const primarySupporterName = state.supporters[0]?.name || null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>

      <div className={styles.steps}>
        {steps.map((step, i) => {
          const done = step.actions.filter(a => a.completed).length
          return (
            <div key={step.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{step.name.trim() || `Step ${i + 1}`}</span>
                  <span className={styles.stepCount}>{done}/{step.actions.length}</span>
                </div>
              )}
              <div className={styles.actionList}>
                {step.actions.map(action => (
                  <CompleteControl
                    key={action.id}
                    actionId={action.id}
                    label={action.label}
                    completed={action.completed}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {state.supporters.length > 0 ? (
        <p className={styles.supporterLine}>
          {primarySupporterName} can cheer this on.
        </p>
      ) : (
        <button type="button" className={styles.reOffer} onClick={() => goTo('offered-social')}>
          Want to add someone to cheer you on? (optional)
        </button>
      )}

      <div className="bottomActions">
        <PrimaryButton disabled={allDone}>
          {allDone ? "You're all caught up — nicely done." : "Mark today's action done"}
        </PrimaryButton>
      </div>
    </div>
  )
}
