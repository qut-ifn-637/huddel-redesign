import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import styles from './OfferedSocial.module.css'

const ROLES = [
  { value: 'close_peer',        label: 'Close peer',              description: 'Sees everything' },
  { value: 'family',            label: 'Family',                  description: 'Sees progress, not the struggles' },
  { value: 'study_friend',      label: 'Study friend',            description: 'Sees this goal only' },
  { value: 'work_availability', label: 'Work — availability only', description: "Sees that you're busy, not what you're working on" },
]

export default function OfferedSocial() {
  const { state, updateState, goTo } = useApp()
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [supporters, setSupporters] = useState(state.supporters)

  function handleAdd() {
    if (name.trim() && selectedRole) {
      setSupporters(prev => [...prev, { name: name.trim(), role: selectedRole }])
      setName('')
      setSelectedRole(null)
    }
  }

  function handleContinue() {
    updateState({ supporters })
    goTo('recognition')
  }

  function handleSkip() {
    updateState({ supporters: [] })
    goTo('recognition')
  }

  const roleDescription = ROLES.find(r => r.value === selectedRole)?.description

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>Want someone in your corner?</h1>
      <p className={styles.subhead}>
        Adding people is optional — and you choose exactly what they see. You can do this any time later.
      </p>

      <div className={styles.avatarGroup} aria-hidden="true">
        <div className={styles.avatar} style={{ background: '#c4b5fd' }}>A</div>
        <div className={styles.avatar} style={{ background: '#a5f3fc' }}>B</div>
        <div className={styles.avatar} style={{ background: '#bbf7d0' }}>C</div>
      </div>

      <div className={styles.addRow}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Name or contact"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className={styles.roleChips}>
        {ROLES.map(role => (
          <button
            key={role.value}
            type="button"
            className={`${styles.roleChip} ${selectedRole === role.value ? styles.roleActive : ''}`}
            onClick={() => setSelectedRole(prev => prev === role.value ? null : role.value)}
          >
            {role.label}
          </button>
        ))}
      </div>

      {roleDescription && (
        <p className={styles.roleDesc}>{roleDescription}</p>
      )}

      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAdd}
        disabled={!name.trim() || !selectedRole}
      >
        Add
      </button>

      {supporters.length > 0 && (
        <ul className={styles.supporterList}>
          {supporters.map((s, i) => (
            <li key={i} className={styles.supporterItem}>
              <span>{s.name}</span>
              <span className={styles.supporterRole}>
                {ROLES.find(r => r.value === s.role)?.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue}>Done — continue</PrimaryButton>
        <SkipButton onClick={handleSkip}>Skip for now</SkipButton>
      </div>
    </div>
  )
}
