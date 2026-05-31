import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import { ROLES } from '../data/roles'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [shared, setShared] = useState(false)

  const flat = allActions(milestones)
  const completedCount = flat.filter(a => a.count > 0).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function applyCount(actionId, fn) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, count: fn(a) } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  function handleComplete(actionId) {
    applyCount(actionId, a => (a.kind === 'once' ? 1 : (a.count || 0) + 1))
  }

  function handleUndo(actionId) {
    applyCount(actionId, a => Math.max(0, (a.count || 0) - 1))
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const supporters = state.supporters

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>
      <p className="scienceNote">Seeing near-term progress sustains motivation. — Bandura &amp; Schunk, 1981</p>

      <div className={styles.steps}>
        {milestones.map((milestone, i) => {
          const done = milestone.actions.filter(a => a.count > 0).length
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
                    count={action.count || 0}
                    repeatable={action.kind !== 'once'}
                    onComplete={handleComplete}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className={styles.adaptBtn}
        onClick={() => {
          updateState({ returnTo: 'return-view' })
          goTo('goal-actions')
        }}
      >
        + Adapt my plan
      </button>

      {supporters.length > 0 ? (
        <div className={styles.corner}>
          <p className={styles.cornerHeader}>Your corner</p>
          <ul className={styles.cornerList}>
            {supporters.map((s, i) => {
              const sees = ROLES.find(r => r.value === s.role)?.sees || 'sees your progress'
              return (
                <li key={i} className={styles.cornerItem}>
                  <span className={styles.cornerName}>{s.name}</span>
                  <span className={styles.cornerSees}>{sees}</span>
                </li>
              )
            })}
          </ul>
          {shared ? (
            <p className={styles.shared}>Shared — your corner can cheer you on ✓</p>
          ) : (
            <button type="button" className={styles.shareBtn} onClick={() => setShared(true)}>
              Share this week&apos;s progress
            </button>
          )}
        </div>
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
