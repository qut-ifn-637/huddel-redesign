import { useState } from 'react'
import { useApp } from '../context/AppContext'
import OptionCard from '../components/OptionCard'
import PrimaryButton from '../components/PrimaryButton'
import styles from './Cadence.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const OPTIONS = [
  { value: 'few_times_week', label: 'A few times a week' },
  { value: 'most_days',      label: 'Most days' },
  { value: 'specific_days',  label: 'Specific days' },
  { value: 'when_i_can',     label: 'Whenever I can' },
]

export default function Cadence() {
  const { state, updateState, goTo } = useApp()
  const [cadence, setCadence] = useState(state.cadence)
  const [cadenceDays, setCadenceDays] = useState(state.cadenceDays)

  const showReassurance = cadence === 'when_i_can'

  function toggleDay(day) {
    setCadenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function handleNext() {
    updateState({ cadence, cadenceDays })
    goTo('offered-social')
  }

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>How often feels realistic?</h1>
      <p className={styles.helper}>No wrong answer. You can change this whenever your week changes.</p>

      <div className={styles.options}>
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={cadence === opt.value}
            onSelect={() => setCadence(opt.value)}
          />
        ))}
      </div>

      {cadence === 'specific_days' && (
        <div className={styles.dayPicker}>
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              className={`${styles.dayChip} ${cadenceDays.includes(day) ? styles.dayActive : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {showReassurance && (
        <p className={styles.reassurance}>
          Smart pick — irregular weeks are exactly what this is built for.
        </p>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext}>Next</PrimaryButton>
      </div>
    </div>
  )
}
