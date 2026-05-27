import { useState } from 'react'
import PrimaryButton from './PrimaryButton'
import styles from './EncouragementSheet.module.css'

export default function EncouragementSheet({ person, contextLine, presets, onClose, onSend }) {
  const [preset, setPreset] = useState(null)
  const [text, setText] = useState('')

  const message = text.trim() || preset
  const canSend = Boolean(message)

  return (
    <div className={styles.esBackdrop} onClick={onClose}>
      <div className={styles.esSheet} onClick={e => e.stopPropagation()}>
        <p className={styles.esContext}>{contextLine}</p>
        <div className={styles.esPresets}>
          {presets.map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.esPreset} ${preset === p ? 'active' : ''}`}
              onClick={() => setPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          className={styles.esInput}
          type="text"
          placeholder="Add your own words (optional)…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <PrimaryButton disabled={!canSend} onClick={() => onSend(message)}>
          Send to {person.name}
        </PrimaryButton>
      </div>
    </div>
  )
}
