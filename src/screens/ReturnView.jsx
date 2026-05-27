import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)

  const flat = allActions(milestones)
  const completedCount = flat.filter(a => a.completed).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, completed: true } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const primarySupporterName = state.supporters[0]?.name || null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>
      <p className="scienceNote">Seeing near-term progress sustains motivation. — Bandura &amp; Schunk, 1981</p>

      <div className={styles.steps}>
        {milestones.map((milestone, i) => {
          const done = milestone.actions.filter(a => a.completed).length
          return (
            <div key={milestone.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{milestone.name.trim() || `Milestone ${i + 1}`}</span>
                  <span className={styles.stepCount}>{done}/{milestone.actions.length}</span>
                </div>
              )}
              <div className={styles.actionList}>
                {milestone.actions.map(action => (
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
