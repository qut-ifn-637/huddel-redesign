import { ROLES } from '../data/roles'
import styles from './SupportingCard.module.css'

export default function SupportingCard({ person, onAct = () => {} }) {
  const shareLabel = ROLES.find(r => r.value === person.role)?.shareLabel

  if (person.role === 'goal') {
    return (
      <div className={styles.scCard}>
        <div className={styles.scTop}>
          <span className={styles.scName}>{person.name}</span>
          <span className={styles.scPillMuted}>{shareLabel}</span>
        </div>
        <p className={styles.scGoal}>{person.goal}</p>
        <p className={styles.scFootnote}>You see the goal, not the day-to-day — and that&apos;s the point.</p>
      </div>
    )
  }

  if (person.role === 'progress') {
    return (
      <div className={styles.scCard}>
        <div className={styles.scTop}>
          <span className={styles.scName}>{person.name}</span>
          <span className={styles.scPillGreen}>{shareLabel}</span>
        </div>
        {person.goal && <p className={styles.scGoal}>{person.goal}</p>}
        <p className={styles.scWin}>● {person.win}</p>
        <button type="button" className={styles.scPrimaryAction} onClick={() => onAct(person, 'cheer')}>
          Cheer this win
        </button>
        <p className={styles.scFootnote}>You see wins, not the hard days.</p>
      </div>
    )
  }

  // role === 'all'
  return (
    <div className={styles.scCard}>
      <div className={styles.scTop}>
        <span className={styles.scName}>{person.name}</span>
        <span className={styles.scPill}>{shareLabel}</span>
      </div>
      <p className={styles.scGoal}>{person.goal}</p>
      <p className={styles.scProgress}>● {person.progress}</p>
      {person.slipped && <p className={styles.scStruggle}>○ {person.slipped}</p>}
      <div className={styles.scActions}>
        <button type="button" className={styles.scPrimaryAction} onClick={() => onAct(person, 'cheer')}>
          Send encouragement
        </button>
        <button type="button" className={styles.scSecondaryAction} onClick={() => onAct(person, 'checkin')}>
          Check in
        </button>
      </div>
    </div>
  )
}
