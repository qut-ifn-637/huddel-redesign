import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import { ROLES } from '../data/roles'
import styles from './ReturnView.module.css'
import { milestoneStatus, formatSoftDate, presetDate } from '../utils/milestoneStatus'

const STATUS_META = {
  ontrack: { cls: 'chipOntrack', label: '● On track' },
  duesoon: { cls: 'chipDuesoon', label: '◐ Due soon' },
  slipped: { cls: 'chipSlipped', label: '○ Slipped' },
}

const PRESETS = [['week', 'This week'], ['fortnight', '2 weeks'], ['month', '1 month']]

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [shared, setShared] = useState(false)
  const [movingId, setMovingId] = useState(null)
  const [notifiedIds, setNotifiedIds] = useState([])

  const flat = allActions(milestones)
  const completedCount = flat.filter(a => a.count > 0).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function applyCount(actionId, fn) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, count: fn(a) } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  function handleComplete(actionId) {
    applyCount(actionId, a => (a.kind === 'once' ? 1 : (a.count || 0) + 1))
  }

  function handleUndo(actionId) {
    applyCount(actionId, a => Math.max(0, (a.count || 0) - 1))
  }

  function setReached(milestoneId, val) {
    const updated = milestones.map(m => (m.id === milestoneId ? { ...m, reached: val } : m))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  function moveDate(milestoneId, iso) {
    const updated = milestones.map(m => (m.id === milestoneId ? { ...m, targetDate: iso } : m))
    setMilestones(updated)
    updateState({ milestones: updated })
    setMovingId(null)
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const supporters = state.supporters

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>
      <p className="scienceNote">Seeing near-term progress sustains motivation. — Bandura &amp; Schunk, 1981</p>

      <div className={styles.steps}>
        {milestones.map((milestone, i) => {
          const done = milestone.actions.filter(a => a.count > 0).length
          const status = milestoneStatus(milestone)
          const name = milestone.name.trim() || `Milestone ${i + 1}`

          if (status === 'reached') {
            return (
              <div key={milestone.id} className={styles.stepGroup}>
                <button type="button" className={styles.reachedLine} onClick={() => setReached(milestone.id, false)}>
                  <span className={styles.reachedChip}>✓ Reached</span>
                  <span className={styles.reachedName}>{name}</span>
                </button>
              </div>
            )
          }

          return (
            <div key={milestone.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{name}</span>
                  {status === 'none' ? (
                    <span className={styles.stepCount}>{done}/{milestone.actions.length}</span>
                  ) : (
                    <span className={styles.stepRight}>
                      <span className={styles.stepDate}>{formatSoftDate(milestone.targetDate)}</span>
                      <span className={`${styles.statusChip} ${styles[STATUS_META[status].cls]}`}>
                        {STATUS_META[status].label}
                      </span>
                    </span>
                  )}
                </div>
              )}
              <div className={styles.actionList}>
                {milestone.actions.map(action => (
                  <CompleteControl
                    key={action.id}
                    actionId={action.id}
                    label={action.label}
                    count={action.count || 0}
                    repeatable={action.kind !== 'once'}
                    onComplete={handleComplete}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
              <button type="button" className={styles.reachLink} onClick={() => setReached(milestone.id, true)}>
                Reached it ✓
              </button>
              {status === 'slipped' && (
                <div className={styles.support}>
                  {notifiedIds.includes(milestone.id) ? (
                    <p className={styles.supportTold}>Your huddle&apos;s been told 💜</p>
                  ) : (
                    <>
                      <p className={styles.supportText}>This one slipped past your date. That&apos;s okay — plans bend.</p>
                      {movingId === milestone.id ? (
                        <div className={styles.movePresets}>
                          {PRESETS.map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              className={styles.movePreset}
                              onClick={() => moveDate(milestone.id, presetDate(key))}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.supportRow}>
                          <button type="button" className={styles.supportMove} onClick={() => setMovingId(milestone.id)}>
                            Move the date
                          </button>
                          <button type="button" className={styles.supportTell} onClick={() => setNotifiedIds(ids => [...ids, milestone.id])}>
                            Let your huddle know
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className={styles.adaptBtn}
        onClick={() => {
          updateState({ returnTo: 'return-view' })
          goTo('goal-actions')
        }}
      >
        + Adapt my plan
      </button>

      {supporters.length > 0 ? (
        <div className={styles.corner}>
          <p className={styles.cornerHeader}>Your corner</p>
          <ul className={styles.cornerList}>
            {supporters.map((s, i) => {
              const sees = ROLES.find(r => r.value === s.role)?.sees || 'sees your progress'
              return (
                <li key={i} className={styles.cornerItem}>
                  <span className={styles.cornerName}>{s.name}</span>
                  <span className={styles.cornerSees}>{sees}</span>
                </li>
              )
            })}
          </ul>
          {shared ? (
            <p className={styles.shared}>Shared — your corner can cheer you on ✓</p>
          ) : (
            <button type="button" className={styles.shareBtn} onClick={() => setShared(true)}>
              Share this week&apos;s progress
            </button>
          )}
        </div>
      ) : (
        <button type="button" className={styles.reOffer} onClick={() => goTo('offered-social')}>
          Want to add someone to cheer you on? (optional)
        </button>
      )}

      <div className="bottomActions">
        <PrimaryButton disabled={allDone}>
          {allDone ? "You're all caught up — nicely done." : "Mark today's action done"}
        </PrimaryButton>
      </div>
    </div>
  )
}
