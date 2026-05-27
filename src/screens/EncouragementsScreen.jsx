import { useState } from 'react'
import { useApp } from '../context/AppContext'
import SegmentedToggle from '../components/SegmentedToggle'
import styles from './EncouragementsScreen.module.css'

const OPTIONS = [
  { value: 'received', label: 'Received' },
  { value: 'sent',     label: 'Sent' },
]

export default function EncouragementsScreen() {
  const { state } = useApp()
  const { received, sent } = state.encouragements
  const [view, setView] = useState('received')

  return (
    <div className="screenPad">
      <h1 className={styles.ecTitle}>Encouragements</h1>
      <SegmentedToggle options={OPTIONS} value={view} onChange={setView} />

      {view === 'received' ? (
        received.length === 0 ? (
          <p className={styles.ecEmpty}>Nothing yet — encouragement from your huddle shows up here.</p>
        ) : (
          <>
            <ul className={styles.ecList}>
              {received.map(e => (
                <li key={e.id} className={styles.ecCheerCard}>
                  <p className={styles.ecMessage}>&ldquo;{e.message}&rdquo;</p>
                  <p className={styles.ecMeta}>{e.from} · {e.when}</p>
                </li>
              ))}
            </ul>
            <p className={styles.ecFootnote}>No counts. No streaks. Just the words.</p>
          </>
        )
      ) : (
        sent.length === 0 ? (
          <p className={styles.ecEmpty}>Nothing sent yet. Cheer someone from Supporting.</p>
        ) : (
          <ul className={styles.ecList}>
            {sent.map(e => (
              <li key={e.id} className={styles.ecCheerCard}>
                <p className={styles.ecMessage}>&ldquo;{e.message}&rdquo;</p>
                <p className={styles.ecMeta}>To {e.to} · {e.when}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
