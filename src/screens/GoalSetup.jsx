import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import styles from './GoalSetup.module.css'

export default function GoalSetup() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)

  function handleContinue() {
    updateState({ goalName })
    goTo('goal-actions')
  }

  return (
    <div className="screenPad">
      <div className={styles.brand}>Huddel</div>
      <h1 className={styles.headline}>What are you working toward?</h1>
      <p className={styles.subhead}>
        Huddel plans around real life — so your goals bend when your week does.
      </p>

      <input
        className={styles.goalInput}
        type="text"
        placeholder="e.g. Pass IFN637"
        value={goalName}
        onChange={e => setGoalName(e.target.value)}
      />
      <p className={styles.helper}>
        Be specific and make it yours — &ldquo;Pass IFN637&rdquo;, not &ldquo;do better&rdquo;.
      </p>
      <p className="scienceNote">
        Specific, meaningful goals are pursued harder. — Locke &amp; Latham, 2002
      </p>

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue} disabled={!goalName.trim()}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
