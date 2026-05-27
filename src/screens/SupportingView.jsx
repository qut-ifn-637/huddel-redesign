import { useState } from 'react'
import { useApp } from '../context/AppContext'
import SupportingCard from '../components/SupportingCard'
import EncouragementSheet from '../components/EncouragementSheet'
import styles from './SupportingView.module.css'

const CHEER_PRESETS = ['Proud of you 💜', 'Keep going!', "You've got this"]
const CHECKIN_PRESETS = ['Thinking of you', 'Proud of you 💜', "You've got this"]

export default function SupportingView() {
  const { state, sendEncouragement } = useApp()
  const people = state.supporting
  const [sheet, setSheet] = useState(null) // { person, mode }
  const [confirmation, setConfirmation] = useState(null)

  function openSheet(person, mode) {
    setConfirmation(null)
    setSheet({ person, mode })
  }

  function handleSend(message) {
    sendEncouragement({ toName: sheet.person.name, message })
    setConfirmation(sheet.person.name)
    setSheet(null)
  }

  function contextLine(person, mode) {
    if (mode === 'checkin') return `Check in with ${person.name}`
    const detail = person.win || person.goal
    return `Cheer ${person.name} — ${detail}`
  }

  return (
    <div>
      <p className={styles.svSubhead}>You see what each person chose to share. Nothing more.</p>
      <p className={styles.svCount}>{people.length} people in your corner</p>
      <p className="scienceNote">You see only what each person chose — visible support can burden more than it helps. — Bolger, Zuckerman &amp; Kessler, 2000</p>

      {confirmation && <p className={styles.svConfirmation}>Sent to {confirmation}.</p>}

      <div className={styles.svList}>
        {people.map(person => (
          <SupportingCard key={person.id} person={person} onAct={openSheet} />
        ))}
      </div>

      {sheet && (
        <EncouragementSheet
          person={sheet.person}
          contextLine={contextLine(sheet.person, sheet.mode)}
          presets={sheet.mode === 'checkin' ? CHECKIN_PRESETS : CHEER_PRESETS}
          onClose={() => setSheet(null)}
          onSend={handleSend}
        />
      )}
    </div>
  )
}
