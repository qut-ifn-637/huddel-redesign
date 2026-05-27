import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import BackButton from '../components/BackButton'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, enterApp, goBack } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [completedAny, setCompletedAny] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

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
    if (!completedAny) {
      setCompletedAny(true)
      setShowContinue(true)
    }
  }

  function handleUndo(actionId) {
    applyCount(actionId, a => Math.max(0, (a.count || 0) - 1))
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <BackButton onClick={goBack} />
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      <div className={styles.milestones}>
        {milestones.map((milestone, i) => (
          <div key={milestone.id} className={styles.milestoneGroup}>
            {showHeaders && (
              <div className={styles.milestoneHeader}>
                {milestone.name.trim() || `Milestone ${i + 1}`}
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
        ))}
      </div>

      <p className={styles.helper}>
        Tap one to mark it done — this is the move you&apos;ll come back for.
      </p>

      {completedAny && (
        <div className={styles.peakMessage}>
          That&apos;s one done. This is how progress adds up.
        </div>
      )}

      {completedAny && (
        <p className="scienceNote">Finishing one small action builds the confidence that drives the next. — Bandura &amp; Schunk, 1981</p>
      )}

      <div className="bottomActions">
        {showContinue && (
          <PrimaryButton onClick={enterApp}>
            {continueLabel}
          </PrimaryButton>
        )}
        <SkipButton onClick={enterApp}>Skip for now</SkipButton>
      </div>
    </div>
  )
}
