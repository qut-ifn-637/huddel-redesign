import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [completed, setCompleted] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const flat = allActions(state.milestones)
  const [targetId] = useState(() => {
    const target = flat.find(a => !a.completed) || flat[0]
    return target ? target.id : null
  })
  const firstAction = flat.find(a => a.id === targetId) || flat[0]
  const ownerMilestone = state.milestones.find(m => m.actions.some(a => a.id === firstAction.id))
  const milestoneLabel = ownerMilestone && ownerMilestone.name.trim() ? ownerMilestone.name.trim() : null

  function handleComplete() {
    const updatedMilestones = state.milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === firstAction.id ? { ...a, completed: true } : a)),
    }))
    updateState({ milestones: updatedMilestones })
    setCompleted(true)
    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      {milestoneLabel && <p className={styles.stepLabel}>{milestoneLabel}</p>}

      <CompleteControl
        actionId={firstAction.id}
        label={firstAction.label}
        completed={completed}
        onComplete={handleComplete}
      />

      <p className={styles.helper}>
        Tap to mark it done — this is the move you&apos;ll come back for.
      </p>

      {completed && (
        <div className={styles.peakMessage}>
          That&apos;s one done. This is how progress adds up.
        </div>
      )}

      {completed && (
        <p className="scienceNote">Finishing one small action builds the confidence that drives the next. — Bandura &amp; Schunk, 1981</p>
      )}

      {showContinue && (
        <button type="button" className={styles.continueBtn} onClick={() => goTo('return-view')}>
          {continueLabel}
        </button>
      )}
    </div>
  )
}
