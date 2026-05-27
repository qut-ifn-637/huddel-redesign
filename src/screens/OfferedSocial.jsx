import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import BackButton from '../components/BackButton'
import { ROLES } from '../data/roles'
import styles from './OfferedSocial.module.css'

export default function OfferedSocial() {
  const { state, updateState, goTo, goBack } = useApp()
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState('progress')
  const [supporters, setSupporters] = useState(state.supporters)

  function handleAdd() {
    if (name.trim() && selectedRole) {
      setSupporters(prev => [...prev, { name: name.trim(), role: selectedRole }])
      setName('')
      setSelectedRole('progress')
    }
  }

  function handleBack() {
    updateState({ supporters })
    goBack()
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
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>Want a supporter in your corner?</h1>
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
      <p className="scienceNote">We follow through more for people we respect — pick someone whose cheer would land. — Klein et al., 2020</p>

      <p className={styles.rolesHeader}>What will they see?</p>
      <div className={styles.roleChips}>
        {ROLES.map(role => (
          <button
            key={role.value}
            type="button"
            className={`${styles.roleChip} ${selectedRole === role.value ? styles.roleActive : ''}`}
            onClick={() => setSelectedRole(prev => (prev === role.value ? null : role.value))}
          >
            {role.label}
            {role.recommended && <span className={styles.recommendedTag}>Recommended</span>}
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
