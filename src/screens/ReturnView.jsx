import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

const ROLE_LABELS = {
  close_peer:        'close peer',
  family:            'family',
  study_friend:      'study friend',
  work_availability: 'work contact',
}

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [actions, setActions] = useState(state.actions)

  const completedCount = actions.filter(a => a.completed).length
  const allDone = completedCount === actions.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = actions.map(a => a.id === actionId ? { ...a, completed: true } : a)
    setActions(updated)
    updateState({ actions: updated })
  }

  const primarySupporterRole = state.supporters[0]
    ? ROLE_LABELS[state.supporters[0].role] || 'supporter'
    : null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>

      <div className={styles.actionList}>
        {actions.map(action => (
          <CompleteControl
            key={action.id}
            actionId={action.id}
            label={action.label}
            completed={action.completed}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {state.supporters.length > 0 ? (
        <p className={styles.supporterLine}>
          Your {primarySupporterRole} can cheer this on.
        </p>
      ) : (
        <button
          type="button"
          className={styles.reOffer}
          onClick={() => goTo('offered-social')}
        >
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
