# Recognition: Show All Actions + Skip — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recognition shows all added actions grouped by milestone with an always-available "Skip for now"; completing any action reveals the calm peak + science note and (after 1.5s) the primary continue.

**Architecture:** Rework `Recognition.jsx` to hold local `milestones` state (like ReturnView), render every action as a tappable `CompleteControl` grouped by milestone, and gate the peak/science-note on a `completedAny` flag and the continue on `showContinue`. Skip and continue both route to `return-view`. Single screen, single task.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. `screenPad`/`bottomActions`/`scienceNote` are global className strings.

Full design + the deferred repeated-vs-one-off note: `docs/superpowers/specs/2026-05-27-recognition-show-all-actions-design.md`.

---

## Task 1: Recognition shows all actions + skip

**Files:**
- Modify: `src/screens/Recognition.jsx`
- Modify: `src/screens/Recognition.module.css`
- Modify: `src/screens/Recognition.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/Recognition.test.jsx`**

Replace the ENTIRE file:

```jsx
import { render, screen, act, fireEvent } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'm1', name: 'Research', actions: [
      { id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false },
      { id: 'a2', label: 'Take notes', source: 'effort', completed: false },
    ]},
    { id: 'm2', name: 'Draft', actions: [
      { id: 'a3', label: 'Write 400 words', source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('shows all added actions', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
  expect(screen.getByText('Take notes')).toBeInTheDocument()
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('shows milestone headers when named and multiple', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('Draft')).toBeInTheDocument()
})

test('a single unnamed milestone renders flat (no header)', () => {
  const flat = {
    ...seedState,
    milestones: [{ id: 'm1', name: '', actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }] }],
  }
  renderWithApp(<Recognition />, { initialStateOverrides: flat })
  expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument()
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
})

test('"Skip for now" is always visible', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
})

test('before any completion there is no peak, science note, or continue button', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.queryByText(/That's one done/)).not.toBeInTheDocument()
  expect(screen.queryByText(/Bandura & Schunk/)).not.toBeInTheDocument()
  expect(screen.queryByText(/See what tomorrow looks like/)).not.toBeInTheDocument()
})

test('completing an action reveals the peak message and science note immediately', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: read 3 sources/i })) })
  expect(screen.getByText(/That's one done/)).toBeInTheDocument()
  expect(screen.getByText(/Bandura & Schunk/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('continue button appears 1.5s after completing (default cadence copy)', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'most_days' } })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: write 400 words/i })) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See what tomorrow looks like/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('continue shows home-base copy for when_i_can cadence', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'when_i_can' } })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: read 3 sources/i })) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See your home base/)).toBeInTheDocument()
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Recognition`
Expected: FAIL — current Recognition shows only one action, has no "Skip for now", and gates the peak on the old single-action flow.

- [ ] **Step 3: Replace `src/screens/Recognition.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [completedAny, setCompletedAny] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  function handleComplete(actionId) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, completed: true } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
    if (!completedAny) {
      setCompletedAny(true)
      setTimeout(() => setShowContinue(true), 1500)
    }
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      <div className={styles.milestones}>
        {milestones.map((milestone, i) => (
          <div key={milestone.id} className={styles.milestoneGroup}>
            {showHeaders && (
              <div className={styles.milestoneHeader}>
                {milestone.name.trim() || `Milestone ${i + 1}`}
              </div>
            )}
            <div className={styles.actionList}>
              {milestone.actions.map(action => (
                <CompleteControl
                  key={action.id}
                  actionId={action.id}
                  label={action.label}
                  completed={action.completed}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.helper}>
        Tap one to mark it done — this is the move you&apos;ll come back for.
      </p>

      {completedAny && (
        <div className={styles.peakMessage}>
          That&apos;s one done. This is how progress adds up.
        </div>
      )}

      {completedAny && (
        <p className="scienceNote">Finishing one small action builds the confidence that drives the next. — Bandura &amp; Schunk, 1981</p>
      )}

      <div className="bottomActions">
        {showContinue && (
          <PrimaryButton onClick={() => goTo('return-view')}>
            {continueLabel}
          </PrimaryButton>
        )}
        <SkipButton onClick={() => goTo('return-view')}>Skip for now</SkipButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/screens/Recognition.module.css`**

```css
.headline {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-7);
}

.milestones {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.milestoneGroup {
  display: flex;
  flex-direction: column;
}

.milestoneHeader {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-3);
}

.actionList {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-top: var(--space-5);
  line-height: 1.5;
}

.peakMessage {
  margin-top: var(--space-6);
  padding: 20px;
  background: var(--color-beige);
  border-left: 4px solid var(--color-success-green);
  border-radius: var(--radius-card);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-black);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

(The old `.stepLabel` and `.continueBtn` classes are intentionally removed — the single milestone label is gone and the continue is now a `PrimaryButton` in the global `.bottomActions` container.)

- [ ] **Step 5: Run Recognition tests to verify they pass**

Run: `npm test -- Recognition`
Expected: PASS — 9 tests.

- [ ] **Step 6: Run the full suite + build to verify no regressions**

Run: `npm test`
Expected: all files pass.

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Recognition.jsx src/screens/Recognition.module.css src/screens/Recognition.test.jsx
git commit -m "feat: Recognition shows all actions grouped by milestone with skip"
```

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §3 show all actions grouped by milestone (same header rule) | `showHeaders` + grouped render (Step 3); tests "shows all added actions", "shows milestone headers", "single unnamed flat" |
| §3 helper reworded | "Tap one to mark it done…" (Step 3) |
| §3 completing → peak + science note (once) + continue after 1.5s | `completedAny`/`showContinue` (Step 3); tests for peak/science-note immediate + continue after 1600ms |
| §3 cadence-aware continue label | `continueLabel` (Step 3); when_i_can test |
| §3 "Skip for now" always present → return-view | SkipButton in bottomActions (Step 3); "always visible" test |
| §5 local milestones + completedAny + showContinue; reuse CompleteControl/SkipButton/PrimaryButton; drop frozen-target | Step 3 |
| §5 bottomActions global container; remove .stepLabel/.continueBtn | Steps 3–4 |
| §6 repeated-vs-one-off deferred | not built; documented in spec |

**Type consistency:** action shape `{ id, label, source, completed }` and milestone shape `{ id, name, actions }` unchanged; `handleComplete(actionId)` matches `CompleteControl`'s `onComplete` contract; `showHeaders` rule identical to ReturnView.

**Placeholder scan:** none — full code in every step.
