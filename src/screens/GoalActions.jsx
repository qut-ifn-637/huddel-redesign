import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import StepCard from '../components/StepCard'
import styles from './GoalActions.module.css'

let nextStep = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)
  const [steps, setSteps] = useState(state.steps)
  const [expandedId, setExpandedId] = useState(state.steps[0]?.id ?? null)

  function updateStep(stepId, updater) {
    setSteps(prev => prev.map(s => (s.id === stepId ? updater(s) : s)))
  }

  function renameStep(stepId, name) {
    updateStep(stepId, s => ({ ...s, name }))
  }

  function addAction(stepId, label, source) {
    updateStep(stepId, s => ({
      ...s,
      actions: [...s.actions, { id: `act-${nextAction++}`, label, source, completed: false }],
    }))
  }

  function removeAction(stepId, actionId) {
    updateStep(stepId, s => ({ ...s, actions: s.actions.filter(a => a.id !== actionId) }))
  }

  function addStep() {
    const id = `step-${nextStep++}`
    setSteps(prev => [...prev, { id, name: '', actions: [] }])
    setExpandedId(id)
  }

  function toggleStep(stepId) {
    setExpandedId(prev => (prev === stepId ? null : stepId))
  }

  function handleNext() {
    const pruned = steps.filter(s => s.actions.length > 0)
    updateState({ goalName, steps: pruned })
    goTo('cadence')
  }

  const canAdvance = goalName.trim().length > 0 && allActions(steps).length > 0

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>What are you working toward?</h1>

      <input
        className={styles.goalInput}
        type="text"
        placeholder="e.g. Finish my essay"
        value={goalName}
        onChange={e => setGoalName(e.target.value)}
      />

      <p className={styles.sectionLabel}>Break it into steps</p>
      <p className={styles.helper}>
        Optional — add as many as help, or keep just one. Describe each action by what you&apos;ll do.
      </p>

      <div className={styles.steps}>
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            position={i + 1}
            expanded={expandedId === step.id}
            onToggle={() => toggleStep(step.id)}
            onRename={name => renameStep(step.id, name)}
            onAddAction={(label, source) => addAction(step.id, label, source)}
            onRemoveAction={actionId => removeAction(step.id, actionId)}
          />
        ))}
      </div>

      <button type="button" className={styles.addStep} onClick={addStep}>
        + Add step
      </button>

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
