import styles from './OnboardingProgress.module.css'

const TOTAL = 4

export default function OnboardingProgress({ step }) {
  return (
    <div className={styles.progress} aria-label={`Step ${step} of ${TOTAL}`}>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i + 1 <= step ? styles.dotFilled : ''}`}
          />
        ))}
      </div>
      <span className={styles.label}>Step {step} of {TOTAL}</span>
    </div>
  )
}
