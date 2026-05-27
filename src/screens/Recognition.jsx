import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [completed, setCompleted] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const flat = allActions(state.steps)
  // Freeze the target action on mount so completing it doesn't make the label
  // jump to the next incomplete action mid-screen.
  const [targetId] = useState(() => {
    const target = flat.find(a => !a.completed) || flat[0]
    return target ? target.id : null
  })
  const firstAction = flat.find(a => a.id === targetId) || flat[0]
  const ownerStep = state.steps.find(s => s.actions.some(a => a.id === firstAction.id))
  const stepLabel = ownerStep && ownerStep.name.trim() ? ownerStep.name.trim() : null

  function handleComplete() {
    const updatedSteps = state.steps.map(s => ({
      ...s,
      actions: s.actions.map(a => (a.id === firstAction.id ? { ...a, completed: true } : a)),
    }))
    updateState({ steps: updatedSteps })
    setCompleted(true)
    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      {stepLabel && <p className={styles.stepLabel}>{stepLabel}</p>}

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

      {showContinue && (
        <button type="button" className={styles.continueBtn} onClick={() => goTo('return-view')}>
          {continueLabel}
        </button>
      )}
    </div>
  )
}
