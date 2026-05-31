import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import BackButton from '../components/BackButton'
import MilestoneCard from '../components/MilestoneCard'
import styles from './GoalActions.module.css'

let nextMilestone = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo, goBack } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [expandedId, setExpandedId] = useState(state.milestones[0]?.id ?? null)
  const [showExample, setShowExample] = useState(true)

  function updateMilestone(milestoneId, updater) {
    setMilestones(prev => prev.map(m => (m.id === milestoneId ? updater(m) : m)))
  }

  function renameMilestone(milestoneId, name) {
    updateMilestone(milestoneId, m => ({ ...m, name }))
  }

  function addAction(milestoneId, label, source) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: [...m.actions, { id: `act-${nextAction++}`, label, source, kind: 'repeat', count: 0 }],
    }))
  }

  function setKind(milestoneId, actionId, kind) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, kind } : a)),
    }))
  }

  function removeAction(milestoneId, actionId) {
    updateMilestone(milestoneId, m => ({ ...m, actions: m.actions.filter(a => a.id !== actionId) }))
  }

  function addMilestone() {
    const id = `milestone-${nextMilestone++}`
    setMilestones(prev => [...prev, { id, name: '', actions: [] }])
    setExpandedId(id)
  }

  function toggleMilestone(milestoneId) {
    setExpandedId(prev => (prev === milestoneId ? null : milestoneId))
  }

  function handleNext() {
    const pruned = milestones.filter(m => m.actions.length > 0)
    if (state.returnTo === 'return-view') {
      updateState({ milestones: pruned, returnTo: null })
      goTo('return-view')
    } else {
      updateState({ milestones: pruned })
      goTo('cadence')
    }
  }

  function handleBack() {
    updateState({ milestones })
    goBack()
  }

  const canAdvance = allActions(milestones).length > 0

  return (
    <div className="screenPad">
      <BackButton onClick={handleBack} />
      {state.goalName && <p className={styles.eyebrow}>{state.goalName}</p>}
      <h1 className={styles.heading}>Break it into milestones</h1>
      <p className="scienceNote">Near-term milestones build momentum and confidence. — Bandura &amp; Schunk, 1981</p>
      <p className={styles.helper}>
        Each milestone is a big step toward your goal. Add the actions you&apos;ll actually do inside it.
      </p>

      {showExample && (
        <div className={styles.exampleMilestone}>
          <div className={styles.exampleTop}>
            <span className={styles.exampleLabel}>Example — tap ✕ to remove</span>
            <button
              type="button"
              className={styles.dismissBtn}
              onClick={() => setShowExample(false)}
              aria-label="Dismiss example"
            >✕</button>
          </div>
          <p className={styles.exampleName}>Write the literature review</p>
          <hr className={styles.exampleDivider} />
          <p className={styles.exampleAction}>Read 2 papers</p>
          <p className={styles.exampleAction}>Write 400 words</p>
          <p className={styles.exampleAction}>Draft intro paragraph</p>
        </div>
      )}

      <div className={styles.milestones}>
        {milestones.map(milestone => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            expanded={expandedId === milestone.id}
            onToggle={() => toggleMilestone(milestone.id)}
            onRename={name => renameMilestone(milestone.id, name)}
            onAddAction={(label, source) => addAction(milestone.id, label, source)}
            onRemoveAction={actionId => removeAction(milestone.id, actionId)}
            onSetKind={(actionId, kind) => setKind(milestone.id, actionId, kind)}
          />
        ))}
      </div>

      <button type="button" className={styles.addMilestone} onClick={addMilestone}>
        + Add milestone
      </button>

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          {state.returnTo === 'return-view' ? 'Save changes' : 'Next'}
        </PrimaryButton>
      </div>
    </div>
  )
}
