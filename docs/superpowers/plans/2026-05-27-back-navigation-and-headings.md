# Back Navigation + Keyword-Forward Headings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add history-stack back navigation across the onboarding (shared `BackButton`, commit-on-back) and make each screen's heading more purpose-indicative.

**Architecture:** `AppContext` gains a `history` stack — `goTo` pushes the current screen, `goBack` pops; expose `goBack` + `canGoBack`. A presentational `BackButton` is wired into the four middle screens via a per-screen `handleBack` that commits working state then calls `goBack`. Headings on the goal/milestones/cadence/supporter screens are reworded.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. `screenPad`/`bottomActions`/`scienceNote` are global className strings.

Full design: `docs/superpowers/specs/2026-05-27-back-navigation-and-headings-design.md`.

---

## File structure

```
src/context/AppContext.jsx        MODIFY — history stack, goBack, canGoBack
src/context/AppContext.test.jsx   MODIFY — goBack/canGoBack tests
src/components/BackButton.jsx      CREATE
src/components/BackButton.module.css CREATE
src/components/BackButton.test.jsx CREATE
src/screens/GoalSetup.jsx          MODIFY — heading
src/screens/GoalSetup.test.jsx     MODIFY — heading
src/App.test.jsx                   MODIFY — load heading
src/screens/GoalActions.jsx        MODIFY — BackButton, eyebrow + milestones h1
src/screens/GoalActions.module.css MODIFY
src/screens/GoalActions.test.jsx   MODIFY
src/screens/Cadence.jsx            MODIFY — BackButton, heading
src/screens/Cadence.test.jsx       MODIFY
src/screens/OfferedSocial.jsx      MODIFY — BackButton, heading
src/screens/OfferedSocial.test.jsx MODIFY
src/screens/Recognition.jsx        MODIFY — BackButton
src/screens/Recognition.test.jsx   MODIFY
```

Tasks 1–2 are foundations; 3–5 consume them. Each task leaves the suite green.

---

## Task 1: AppContext history stack + goBack

**Files:** Modify `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`

- [ ] **Step 1: Add tests to `src/context/AppContext.test.jsx`**

Append these tests to the end of the file:

```jsx
test('goBack returns to the previous screen after navigating forward', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goTo('cadence') })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('cadence')
  act(() => { result.current.goBack() })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('goal')
  vi.useRealTimers()
})

test('canGoBack is false initially and true after navigating forward', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.canGoBack).toBe(false)
  act(() => { result.current.goTo('cadence') })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.canGoBack).toBe(true)
  vi.useRealTimers()
})

test('goBack is a no-op when there is no history', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goBack() })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('goal')
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- AppContext`
Expected: FAIL — `goBack`/`canGoBack` are undefined.

- [ ] **Step 3: Replace `src/context/AppContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'

const defaultState = {
  goalName: '',
  milestones: [
    { id: 'milestone-1', name: '', actions: [] },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
}

const AppContext = createContext(null)

export function allActions(milestones) {
  return milestones.flatMap(m => m.actions)
}

export function AppProvider({ children, initialStateOverrides = {} }) {
  const [state, setState] = useState({ ...defaultState, ...initialStateOverrides })
  const [currentScreen, setCurrentScreen] = useState('goal')
  const [history, setHistory] = useState([])
  const [fading, setFading] = useState(false)

  function navigate(screenId) {
    setFading(true)
    setTimeout(() => {
      setCurrentScreen(screenId)
      setFading(false)
    }, 150)
  }

  function goTo(screenId) {
    setHistory(h => [...h, currentScreen])
    navigate(screenId)
  }

  function goBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    navigate(prev)
  }

  function updateState(updates) {
    setState(prev => ({ ...prev, ...updates }))
  }

  const canGoBack = history.length > 0

  return (
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, goBack, canGoBack, updateState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 4: Run the full suite to verify green**

Run: `npm test`
Expected: all pass (the change is additive; existing `goTo` behaviour unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: add history-stack back navigation to AppContext"
```

---

## Task 2: BackButton component

**Files:** Create `src/components/BackButton.jsx`, `BackButton.module.css`, `BackButton.test.jsx`

- [ ] **Step 1: Write `src/components/BackButton.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackButton from './BackButton'

test('renders a back control', () => {
  render(<BackButton onClick={() => {}} />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})

test('calls onClick when clicked', async () => {
  const onClick = vi.fn()
  render(<BackButton onClick={onClick} />)
  await userEvent.click(screen.getByRole('button', { name: /go back/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- BackButton`
Expected: FAIL — `Cannot find module './BackButton'`.

- [ ] **Step 3: Create `src/components/BackButton.jsx`**

```jsx
import styles from './BackButton.module.css'

export default function BackButton({ onClick }) {
  return (
    <button type="button" className={styles.back} onClick={onClick} aria-label="Go back">
      ← Back
    </button>
  )
}
```

- [ ] **Step 4: Create `src/components/BackButton.module.css`**

```css
.back {
  background: none;
  border: none;
  color: var(--color-purple);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: var(--space-4);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- BackButton`
Expected: PASS — 2 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/BackButton.jsx src/components/BackButton.module.css src/components/BackButton.test.jsx
git commit -m "feat: add shared BackButton component"
```

---

## Task 3: GoalSetup heading

**Files:** Modify `src/screens/GoalSetup.jsx`, `src/screens/GoalSetup.test.jsx`, `src/App.test.jsx`

- [ ] **Step 1: Update the heading assertions in the tests**

In `src/screens/GoalSetup.test.jsx`, in the "renders brand, headline, and value-prop subhead" test, change:

```jsx
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
```

to:

```jsx
  expect(screen.getByText('What goal are you working on?')).toBeInTheDocument()
```

In `src/App.test.jsx`, in the "renders the goal-setup screen on load" test, change the same string:

```jsx
  expect(screen.getByText('What goal are you working on?')).toBeInTheDocument()
```

(Leave the `expect(screen.getByText('Huddel'))` assertion as-is.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- GoalSetup App`
Expected: FAIL — the heading still reads "What are you working toward?".

- [ ] **Step 3: Update the heading in `src/screens/GoalSetup.jsx`**

Change:

```jsx
      <h1 className={styles.headline}>What are you working toward?</h1>
```

to:

```jsx
      <h1 className={styles.headline}>What goal are you working on?</h1>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- GoalSetup App`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/GoalSetup.jsx src/screens/GoalSetup.test.jsx src/App.test.jsx
git commit -m "feat: clearer goal-setup heading (mentions 'goal')"
```

---

## Task 4: GoalActions — BackButton + milestones heading

**Files:** Modify `src/screens/GoalActions.jsx`, `src/screens/GoalActions.module.css`, `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Update `src/screens/GoalActions.test.jsx`**

Replace the first test ("shows the goal name and a back-to-goal affordance") with:

```jsx
test('shows the goal name and a back control', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Finish my essay')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})
```

Leave the other tests unchanged (they still assert "Break it into milestones", the Bandura note, no tab toggle, milestone editable, Next gating, + Add milestone).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- GoalActions`
Expected: FAIL — the back control is still "Edit goal", not "Go back".

- [ ] **Step 3: Replace `src/screens/GoalActions.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import BackButton from '../components/BackButton'
import MilestoneCard from '../components/MilestoneCard'
import styles from './GoalActions.module.css'

let nextMilestone = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo, goBack } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [expandedId, setExpandedId] = useState(state.milestones[0]?.id ?? null)

  function updateMilestone(milestoneId, updater) {
    setMilestones(prev => prev.map(m => (m.id === milestoneId ? updater(m) : m)))
  }

  function renameMilestone(milestoneId, name) {
    updateMilestone(milestoneId, m => ({ ...m, name }))
  }

  function addAction(milestoneId, label, source) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: [...m.actions, { id: `act-${nextAction++}`, label, source, completed: false }],
    }))
  }

  function removeAction(milestoneId, actionId) {
    updateMilestone(milestoneId, m => ({ ...m, actions: m.actions.filter(a => a.id !== actionId) }))
  }

  function addMilestone() {
    const id = `milestone-${nextMilestone++}`
    setMilestones(prev => [...prev, { id, name: '', actions: [] }])
    setExpandedId(id)
  }

  function toggleMilestone(milestoneId) {
    setExpandedId(prev => (prev === milestoneId ? null : milestoneId))
  }

  function handleNext() {
    const pruned = milestones.filter(m => m.actions.length > 0)
    updateState({ milestones: pruned })
    goTo('cadence')
  }

  function handleBack() {
    updateState({ milestones })
    goBack()
  }

  const canAdvance = allActions(milestones).length > 0

  return (
    <div className="screenPad">
      <BackButton onClick={handleBack} />
      {state.goalName && <p className={styles.eyebrow}>{state.goalName}</p>}
      <h1 className={styles.heading}>Break it into milestones</h1>
      <p className="scienceNote">Near-term milestones build momentum and confidence. — Bandura &amp; Schunk, 1981</p>
      <p className={styles.helper}>
        Optional — add as many as help, or keep just one. Each milestone holds the effort actions you&apos;ll actually do.
      </p>

      <div className={styles.milestones}>
        {milestones.map(milestone => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            expanded={expandedId === milestone.id}
            onToggle={() => toggleMilestone(milestone.id)}
            onRename={name => renameMilestone(milestone.id, name)}
            onAddAction={(label, source) => addAction(milestone.id, label, source)}
            onRemoveAction={actionId => removeAction(milestone.id, actionId)}
          />
        ))}
      </div>

      <button type="button" className={styles.addMilestone} onClick={addMilestone}>
        + Add milestone
      </button>

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/screens/GoalActions.module.css`**

```css
.eyebrow {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-body-gray);
  margin-bottom: var(--space-2);
}

.heading {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-2);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-5);
  line-height: 1.5;
}

.milestones {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

.addMilestone {
  width: 100%;
  border: 1px dashed #c8bfff;
  color: var(--color-purple);
  background: none;
  border-radius: var(--radius-card);
  padding: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: var(--space-6);
  transition: border-color 0.15s;
}

.addMilestone:hover {
  border-color: var(--color-purple);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- GoalActions`
Expected: PASS — 7 tests.

- [ ] **Step 6: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: GoalActions uses shared BackButton; milestones is the heading"
```

---

## Task 5: Back + headings on Cadence, OfferedSocial, Recognition

**Files:** Modify `src/screens/Cadence.jsx` + `.test.jsx`, `src/screens/OfferedSocial.jsx` + `.test.jsx`, `src/screens/Recognition.jsx` + `.test.jsx`

- [ ] **Step 1: Update the three test files**

In `src/screens/Cadence.test.jsx`: change the "renders headline verbatim" assertion from `'How often feels realistic?'` to `'How often can you work on this?'`, and append:

```jsx
test('renders a back control', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})
```

In `src/screens/OfferedSocial.test.jsx`: change the "renders headline verbatim" assertion from `'Want someone in your corner?'` to `'Want a supporter in your corner?'`, and append:

```jsx
test('renders a back control', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})
```

In `src/screens/Recognition.test.jsx`: append (the seedState already exists at the top of that file):

```jsx
test('renders a back control', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Cadence OfferedSocial Recognition`
Expected: FAIL — headings unchanged and no back control yet.

- [ ] **Step 3: Edit `src/screens/Cadence.jsx`**

Add the `BackButton` import after the PrimaryButton import:

```jsx
import BackButton from '../components/BackButton'
```

Add `goBack` to the context destructure:

```jsx
  const { state, updateState, goTo, goBack } = useApp()
```

Add a `handleBack` (place it just before `handleNext`):

```jsx
  function handleBack() {
    updateState({ cadence, cadenceDays })
    goBack()
  }
```

Replace the opening of the returned markup — change:

```jsx
    <div className="screenPad">
      <h1 className={styles.headline}>How often feels realistic?</h1>
```

to:

```jsx
    <div className="screenPad">
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>How often can you work on this?</h1>
```

- [ ] **Step 4: Edit `src/screens/OfferedSocial.jsx`**

Add the `BackButton` import after the SkipButton import:

```jsx
import BackButton from '../components/BackButton'
```

Add `goBack` to the context destructure:

```jsx
  const { state, updateState, goTo, goBack } = useApp()
```

Add a `handleBack` (place it just before `handleContinue`):

```jsx
  function handleBack() {
    updateState({ supporters })
    goBack()
  }
```

Change the opening markup — replace:

```jsx
    <div className="screenPad">
      <h1 className={styles.headline}>Want someone in your corner?</h1>
```

with:

```jsx
    <div className="screenPad">
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>Want a supporter in your corner?</h1>
```

- [ ] **Step 5: Edit `src/screens/Recognition.jsx`**

Add the `BackButton` import after the SkipButton import:

```jsx
import BackButton from '../components/BackButton'
```

Add `goBack` to the context destructure:

```jsx
  const { state, updateState, goTo, goBack } = useApp()
```

Change the opening markup — replace:

```jsx
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>
```

with:

```jsx
    <div className="screenPad">
      <BackButton onClick={goBack} />
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>
```

(Recognition's completions are already written to state on each tap, so its back needs no extra commit — wire `goBack` directly.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- Cadence OfferedSocial Recognition`
Expected: PASS.

- [ ] **Step 7: Run the full suite + build**

Run: `npm test`
Expected: all files pass.

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Cadence.jsx src/screens/Cadence.test.jsx src/screens/OfferedSocial.jsx src/screens/OfferedSocial.test.jsx src/screens/Recognition.jsx src/screens/Recognition.test.jsx
git commit -m "feat: add back navigation to Cadence/Supporters/Recognition; clearer headings"
```

---

## Task 6: End-to-end verification

No code unless a defect surfaces.

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: all files pass.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 3: Manual click-through (390px)**

Run `npm run dev`. Verify: Goal ("What goal are you working on?") → no back. Each subsequent screen shows "← Back" top-left and returns to the prior screen with prior answers intact (goal name, milestones, cadence, supporters). The Milestones page shows the goal as an eyebrow above the "Break it into milestones" heading. Cadence reads "How often can you work on this?"; Supporters reads "Want a supporter in your corner?". From the Home base, the re-offer → Supporters → back returns to the Home base. Home base has no back.

- [ ] **Step 4: Commit any fixes** (skip if none)

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §2.1 history stack (goTo push, goBack, canGoBack) | Task 1 |
| §2.2 scope (4 screens; not GoalSetup/ReturnView) | Tasks 4–5 add BackButton only to those 4; GoalSetup/ReturnView untouched |
| §2.3 commit-on-back (milestones unpruned / cadence / supporters / Recognition none) | Task 4 handleBack, Task 5 Cadence/OfferedSocial handleBack, Recognition `goBack` direct |
| §2.4 shared BackButton, replaces "Edit goal" | Task 2; Task 4 |
| §3 headings (goal / milestones h1+eyebrow / cadence / supporter) | Tasks 3, 4, 5 |
| §5 testing | each task's tests |

**Type consistency:** `goBack`/`canGoBack` added to context value and consumed via `useApp()` in GoalActions/Cadence/OfferedSocial/Recognition; `BackButton` takes `onClick`; `handleBack` commits the same fields each screen's forward action writes (GoalActions milestones unpruned, Cadence cadence+cadenceDays, OfferedSocial supporters). Heading strings match between screen and test in every task.

**Placeholder scan:** none — full code/edits in every step.

**Green-between-tasks:** Tasks 1–2 are additive (suite stays green). Tasks 3–5 each update their screens' tests in lockstep with the code. Recognition/Cadence/OfferedSocial render `BackButton` unconditionally, so their direct-render tests (history empty, `goBack` a no-op) still find the control and don't crash.
