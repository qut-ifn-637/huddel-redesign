import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import styles from './MyHuddleView.module.css'

export default function MyHuddleView() {
  const { state, updateState } = useApp()
  const supporters = state.supporters
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('progress')

  function handleAdd() {
    if (!name.trim()) return
    const next = [...supporters, { id: `sup-${Date.now()}`, name: name.trim(), role }]
    updateState({ supporters: next })
    setName('')
    setRole('progress')
    setAdding(false)
  }

  return (
    <div>
      <p className={styles.mhSubhead}>You choose what each one sees.</p>
      {supporters.length === 0 && !adding && (
        <p className={styles.mhEmpty}>No one yet — and that&apos;s completely fine.</p>
      )}
      <p className="scienceNote">You choose what each person sees — broadcasting an identity-goal too widely can sap the drive to pursue it. — Gollwitzer et al., 2009</p>

      <ul className={styles.mhList}>
        {supporters.map(s => {
          const role = ROLES.find(r => r.value === s.role)
          return (
            <li key={s.id ?? s.name} className={styles.mhHuddleCard}>
              <div className={styles.mhCardTop}>
                <span className={styles.mhName}>{s.name}</span>
                <span className={styles.mhPill}>{role?.label}</span>
              </div>
              <p className={styles.mhSees}>{role?.sees}</p>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <div className={styles.mhAddForm}>
          <input
            className={styles.mhInput}
            type="text"
            placeholder="Name or contact"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className={styles.mhRoleChips}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`${styles.mhChip} ${role === r.value ? 'active' : ''}`}
                onClick={() => setRole(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.mhAddBtn} onClick={handleAdd} disabled={!name.trim()}>Add</button>
        </div>
      ) : (
        <button type="button" className={styles.mhAddLink} onClick={() => setAdding(true)}>+ Add someone</button>
      )}
    </div>
  )
}
