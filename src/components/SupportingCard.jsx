import { ROLES } from '../data/roles'
import styles from './SupportingCard.module.css'

export default function SupportingCard({ person, onAct = () => {} }) {
  const shareLabel = ROLES.find(r => r.value === person.role)?.shareLabel

  if (person.role === 'availability') {
    return (
      <div className={`${styles.card} ${styles.quiet}`}>
        <div className={styles.top}>
          <span className={styles.nameMuted}>{person.name}</span>
          <span className={styles.pillMuted}>{shareLabel}</span>
        </div>
        <p className={styles.spaceLine}>{person.status} — give them space.</p>
        <p className={styles.footnote}>No goal shared. Nothing to do here, and that&apos;s the point.</p>
      </div>
    )
  }

  if (person.role === 'progress') {
    return (
      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.name}>{person.name}</span>
          <span className={styles.pillGreen}>{shareLabel}</span>
        </div>
        <p className={styles.win}>● {person.win}</p>
        <button type="button" className={styles.primaryAction} onClick={() => onAct(person, 'cheer')}>
          Cheer this win
        </button>
        <p className={styles.footnote}>You see wins, not the hard days.</p>
      </div>
    )
  }

  // role === 'all'
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.name}>{person.name}</span>
        <span className={styles.pill}>{shareLabel}</span>
      </div>
      <p className={styles.goal}>{person.goal}</p>
      <p className={styles.progress}>● {person.progress}</p>
      {person.struggleFlag && <p className={styles.struggle}>○ Flagged a rough week</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryAction} onClick={() => onAct(person, 'cheer')}>
          Send encouragement
        </button>
        <button type="button" className={styles.secondaryAction} onClick={() => onAct(person, 'checkin')}>
          Check in
        </button>
      </div>
    </div>
  )
}
