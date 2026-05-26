import { useState } from 'react'
import { useApp } from '../context/AppContext'
import OptionCard from '../components/OptionCard'
import PrimaryButton from '../components/PrimaryButton'
import styles from './Welcome.module.css'

const OPTIONS = [
  { value: 'work',      label: 'Work' },
  { value: 'study',     label: 'Study' },
  { value: 'both',      label: 'Both work and study' },
  { value: 'life_full', label: "Life's just full right now" },
]

export default function Welcome() {
  const { updateState, goTo } = useApp()
  const [selected, setSelected] = useState(null)

  function handleSelect(value) {
    setSelected(value)
  }

  function handleContinue() {
    updateState({ context: selected })
    goTo('goal-actions')
  }

  return (
    <div className="screenPad">
      <div className={styles.brand}>Huddel</div>

      <h1 className={styles.headline}>What&apos;s pulling at your time right now?</h1>
      <p className={styles.subhead}>
        Huddel plans around real life — so your goals bend when your week does.
      </p>

      <div className={styles.options}>
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onSelect={() => handleSelect(opt.value)}
          />
        ))}
      </div>

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue} disabled={!selected}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
