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
      <p className={styles.subhead}>You choose what each one sees.</p>
      {supporters.length === 0 && !adding && (
        <p className={styles.empty}>No one yet — and that&apos;s completely fine.</p>
      )}
      <p className="scienceNote">You choose what each person sees — broadcasting an identity-goal too widely can sap the drive to pursue it. — Gollwitzer et al., 2009</p>

      <ul className={styles.list}>
        {supporters.map(s => {
          const role = ROLES.find(r => r.value === s.role)
          return (
            <li key={s.id ?? s.name} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.pill}>{role?.label}</span>
              </div>
              <p className={styles.sees}>{role?.sees}</p>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <div className={styles.addForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Name or contact"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className={styles.roleChips}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`${styles.chip} ${role === r.value ? 'active' : ''}`}
                onClick={() => setRole(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={handleAdd} disabled={!name.trim()}>Add</button>
        </div>
      ) : (
        <button type="button" className={styles.addLink} onClick={() => setAdding(true)}>+ Add someone</button>
      )}
    </div>
  )
}
