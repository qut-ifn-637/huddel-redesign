import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [completed, setCompleted] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const firstAction = state.actions[0]

  function handleComplete() {
    const updatedActions = state.actions.map(a =>
      a.id === firstAction.id ? { ...a, completed: true } : a
    )
    updateState({ actions: updatedActions })
    setCompleted(true)

    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

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
        <button
          type="button"
          className={styles.continueBtn}
          onClick={() => goTo('return-view')}
        >
          {continueLabel}
        </button>
      )}
    </div>
  )
}
