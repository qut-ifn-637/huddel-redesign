import { useEffect } from 'react'
import styles from './Celebration.module.css'

const COLORS = ['var(--color-purple)', 'var(--color-coral)', 'var(--color-success-green)', 'var(--color-sunshine-yellow)', '#b9a8f5']

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const ang = (Math.PI * 2 * i) / 12 + i * 0.7
  const dist = 34 + (i % 4) * 12
  return {
    dx: Math.cos(ang) * dist,
    dy: Math.sin(ang) * dist - 18,
    rot: i * 47,
    color: COLORS[i % COLORS.length],
  }
})

export default function Celebration({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => { if (onDone) onDone() }, 1900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={styles.celebration}>
      <div className={styles.burst} aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, background: p.color }}
          />
        ))}
      </div>
      <p className={styles.cheer} role="status">Milestone reached 🎉</p>
    </div>
  )
}
