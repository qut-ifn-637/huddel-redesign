import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import MilestoneCard from '../components/MilestoneCard'
import styles from './GoalActions.module.css'

let nextMilestone = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [expandedId, setExpandedId] = useState(state.milestones[0]?.id ?? null)

  function updateMilestone(milestoneId, updater) {
    setMilestones(prev => prev.map(m => (m.id === milestoneId ? updater(m) : m)))
  }

  function renameMilestone(milestoneId, name) {
    updateMilestone(milestoneId, m => ({ ...m, name }))
  }

  function addAction(milestoneId, label, source) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: [...m.actions, { id: `act-${nextAction++}`, label, source, completed: false }],
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
    updateState({ milestones: pruned })
    goTo('cadence')
  }

  const canAdvance = allActions(milestones).length > 0

  return (
    <div className="screenPad">
      <button type="button" className={styles.back} onClick={() => goTo('goal')}>← Edit goal</button>
      <h1 className={styles.goalHeading}>{state.goalName}</h1>

      <p className={styles.sectionLabel}>Break it into milestones</p>
      <p className="scienceNote">Near-term milestones build momentum and confidence. — Bandura &amp; Schunk, 1981</p>
      <p className={styles.helper}>
        Optional — add as many as help, or keep just one. Each milestone holds the effort actions you&apos;ll actually do.
      </p>

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
          />
        ))}
      </div>

      <button type="button" className={styles.addMilestone} onClick={addMilestone}>
        + Add milestone
      </button>

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
