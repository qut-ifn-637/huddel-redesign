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
      <h1 className={styles.title}>Encouragements</h1>
      <SegmentedToggle options={OPTIONS} value={view} onChange={setView} />

      {view === 'received' ? (
        <>
          <ul className={styles.list}>
            {received.map(e => (
              <li key={e.id} className={styles.card}>
                <p className={styles.message}>&ldquo;{e.message}&rdquo;</p>
                <p className={styles.meta}>{e.from} · {e.when}</p>
              </li>
            ))}
          </ul>
          <p className={styles.footnote}>No counts. No streaks. Just the words.</p>
        </>
      ) : (
        sent.length === 0 ? (
          <p className={styles.empty}>Nothing sent yet. Cheer someone from Supporting.</p>
        ) : (
          <ul className={styles.list}>
            {sent.map(e => (
              <li key={e.id} className={styles.card}>
                <p className={styles.message}>&ldquo;{e.message}&rdquo;</p>
                <p className={styles.meta}>To {e.to} · {e.when}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
