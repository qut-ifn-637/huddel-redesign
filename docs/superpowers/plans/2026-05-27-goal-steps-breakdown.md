# Step-Based Goal Breakdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, effort-framed "Steps" layer between a goal and its effort-actions on Screen 02, propagated through Recognition (05) and the Return view (06), without ever using the word "milestone".

**Architecture:** `AppContext` switches from a flat `actions[]` to a nested `steps[]` model (`{ id, name, actions[] }`) plus an `allActions(steps)` selector. Screen 02 becomes a single-open accordion of `StepCard` components; Recognition surfaces the first incomplete action across steps; the Return view groups actions under step headers. Steps are optional — one empty step on load, no pre-seeded action, effort-only action chips.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. CSS-module class names are unhashed in tests (`vite.config.js` already sets `generateScopedName: '[local]'`), so `toHaveClass('completed')` works.

Full design rationale: `docs/superpowers/specs/2026-05-27-goal-steps-breakdown-design.md`.

---

## File structure

```
src/
├── context/
│   ├── AppContext.jsx          MODIFY — steps model + allActions() export
│   └── AppContext.test.jsx     MODIFY — new shape + helper tests
├── components/
│   ├── StepCard.jsx            CREATE — accordion step card (name, action list, effort chips)
│   ├── StepCard.module.css     CREATE
│   └── StepCard.test.jsx       CREATE
└── screens/
    ├── GoalActions.jsx         MODIFY — accordion of StepCards, write steps
    ├── GoalActions.module.css  MODIFY — drop tabs/chips, add steps/addStep
    ├── GoalActions.test.jsx    MODIFY — new behaviour
    ├── Recognition.jsx         MODIFY — first incomplete action across steps + step label
    ├── Recognition.module.css  MODIFY — add .stepLabel
    ├── Recognition.test.jsx    MODIFY — seed steps
    ├── ReturnView.jsx          MODIFY — group actions under step headers
    ├── ReturnView.module.css   MODIFY — add step group/header styles
    └── ReturnView.test.jsx     MODIFY — seed steps
```

**Sequencing note (read before starting):** Task 2 flips the shared state shape and rewrites Screen 02. Between Task 2 and Task 3 the **unit test suite stays green**, but the *live* click-through flow is temporarily broken (Recognition/ReturnView still read the old `state.actions` until Tasks 3–4 migrate them). This is expected. Task 5 verifies the full live flow end-to-end. Do not "fix" Recognition/ReturnView early — follow the task order.

---

## Task 1: StepCard component

A standalone, presentational accordion card. No `AppContext` dependency — it receives everything via props and reports changes via callbacks. This keeps it testable in isolation.

**Files:**
- Create: `src/components/StepCard.jsx`
- Create: `src/components/StepCard.module.css`
- Create: `src/components/StepCard.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/StepCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StepCard from './StepCard'

const emptyStep = { id: 's1', name: '', actions: [] }
const filledStep = {
  id: 's1',
  name: 'Research',
  actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }],
}

const noop = () => {}

function renderCard(overrides = {}) {
  const props = {
    step: emptyStep,
    position: 1,
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    ...overrides,
  }
  return render(<StepCard {...props} />)
}

test('shows "Step N" in the header when name is empty', () => {
  renderCard({ step: emptyStep, position: 1 })
  expect(screen.getByText('Step 1')).toBeInTheDocument()
})

test('shows the step name in the header when provided', () => {
  renderCard({ step: filledStep, position: 2 })
  expect(screen.getByText('Research')).toBeInTheDocument()
})

test('clicking the header calls onToggle', async () => {
  const onToggle = vi.fn()
  renderCard({ onToggle })
  await userEvent.click(screen.getByText('Step 1'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('collapsed card hides the effort chips', () => {
  renderCard({ expanded: false })
  expect(screen.queryByText('Write 400 words')).not.toBeInTheDocument()
})

test('expanded card shows effort chips and adds an effort action on tap', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onAddAction).toHaveBeenCalledWith('Write 400 words', 'effort')
})

test('expanded card lists existing actions and removes them', async () => {
  const onRemoveAction = vi.fn()
  renderCard({ step: filledStep, expanded: true, onRemoveAction })
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /remove read 3 sources/i }))
  expect(onRemoveAction).toHaveBeenCalledWith('a1')
})

test('custom action submits with source "custom"', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('+ Write my own'))
  await userEvent.type(screen.getByPlaceholderText(/describe your action/i), 'Outline intro')
  await userEvent.click(screen.getByRole('button', { name: /^add$/i }))
  expect(onAddAction).toHaveBeenCalledWith('Outline intro', 'custom')
})

test('editing the name field calls onRename', async () => {
  const onRename = vi.fn()
  renderCard({ expanded: true, onRename })
  await userEvent.type(screen.getByPlaceholderText(/name this step/i), 'R')
  expect(onRename).toHaveBeenCalled()
})

test('does not contain the word milestone', () => {
  renderCard({ step: filledStep, expanded: true })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- StepCard`
Expected: FAIL with `Cannot find module './StepCard'`.

- [ ] **Step 3: Create `src/components/StepCard.jsx`**

```jsx
import { useState } from 'react'
import styles from './StepCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

export default function StepCard({ step, position, expanded, onToggle, onRename, onAddAction, onRemoveAction }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const displayName = step.name.trim() || `Step ${position}`
  const count = step.actions.length

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) {
      onAddAction(customInput.trim(), 'custom')
      setCustomInput('')
      setShowCustom(false)
    }
  }

  return (
    <div className={styles.card}>
      <button type="button" className={styles.header} aria-expanded={expanded} onClick={onToggle}>
        <span className={styles.headerName}>{displayName}</span>
        <span className={styles.headerMeta}>
          {expanded ? '▾' : `${count} action${count !== 1 ? 's' : ''} ▸`}
        </span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Name this step (optional)"
            value={step.name}
            onChange={e => onRename(e.target.value)}
          />

          {count > 0 && (
            <ul className={styles.actionList}>
              {step.actions.map(action => (
                <li key={action.id} className={styles.actionItem}>
                  <span>{action.label}</span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemoveAction(action.id)}
                    aria-label={`Remove ${action.label}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.addLabel}>Add an effort-based action</p>
          <div className={styles.chips}>
            {EFFORT_CHIPS.map(chip => (
              <button key={chip} type="button" className={styles.chip} onClick={() => onAddAction(chip, 'effort')}>
                {chip}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.chip} ${styles.chipCustom}`}
              onClick={() => setShowCustom(true)}
            >
              + Write my own
            </button>
          </div>

          {showCustom && (
            <form className={styles.customForm} onSubmit={handleCustomSubmit}>
              <input
                autoFocus
                className={styles.customInput}
                type="text"
                placeholder="Describe your action…"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
              />
              <button type="submit" className={styles.customAdd}>Add</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/StepCard.module.css`**

```css
.card {
  border: 1.5px solid #e6e0ff;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);
  overflow: hidden;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-purple-tint);
  color: var(--color-purple);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  padding: 12px 14px;
  border: none;
  cursor: pointer;
  text-align: left;
}

.headerMeta {
  font-weight: 500;
  font-size: 13px;
}

.body {
  padding: 12px 14px;
}

.nameInput {
  width: 100%;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 15px;
  border: 1.5px solid #ddd;
  border-radius: 12px;
  outline: none;
  margin-bottom: var(--space-4);
  transition: border-color 0.15s;
}

.nameInput:focus {
  border-color: var(--color-purple);
}

.actionList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.actionItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--color-beige);
  border-radius: 14px;
  font-size: 14px;
}

.removeBtn {
  background: none;
  border: none;
  color: var(--color-body-gray);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.addLabel {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-body-gray);
  margin-bottom: var(--space-3);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.chip {
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-beige);
  color: var(--color-black);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.chip:active {
  background: var(--color-purple-tint);
}

.chipCustom {
  color: var(--color-purple);
}

.customForm {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.customInput {
  flex: 1;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 15px;
  border: 1.5px solid var(--color-purple);
  border-radius: 12px;
  outline: none;
}

.customAdd {
  padding: 10px 16px;
  background: var(--color-purple);
  color: white;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- StepCard`
Expected: PASS — 9 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/StepCard.jsx src/components/StepCard.module.css src/components/StepCard.test.jsx
git commit -m "feat: add StepCard accordion component for goal steps"
```

---

## Task 2: AppContext steps model + GoalActions rewrite

Flips the shared state shape and rewrites Screen 02 together (they must change as one unit to keep the suite green). After this task all unit tests pass; the live flow past Screen 03 is temporarily broken until Tasks 3–4.

**Files:**
- Modify: `src/context/AppContext.jsx`
- Modify: `src/context/AppContext.test.jsx`
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.module.css`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Rewrite `src/context/AppContext.test.jsx`**

Replace the entire file:

```jsx
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp, allActions } from './AppContext'

function wrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}

test('initial state has one empty step', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.steps).toHaveLength(1)
  expect(result.current.state.steps[0].name).toBe('')
  expect(result.current.state.steps[0].actions).toEqual([])
})

test('initial state has correct defaults', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state.context).toBeNull()
  expect(state.goalName).toBe('')
  expect(state.cadence).toBe('few_times_week')
  expect(state.cadenceDays).toEqual([])
  expect(state.supporters).toEqual([])
})

test('currentScreen starts at welcome', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('welcome')
})

test('updateState merges partial updates without clobbering other fields', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.updateState({ goalName: 'My goal' }) })
  expect(result.current.state.goalName).toBe('My goal')
  expect(result.current.state.cadence).toBe('few_times_week')
})

test('goTo changes currentScreen after 150ms', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goTo('cadence') })
  expect(result.current.currentScreen).toBe('welcome')
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('cadence')
  vi.useRealTimers()
})

test('initialStateOverrides are applied when provided', () => {
  function customWrapper({ children }) {
    return (
      <AppProvider initialStateOverrides={{ goalName: 'Pre-filled goal' }}>
        {children}
      </AppProvider>
    )
  }
  const { result } = renderHook(() => useApp(), { wrapper: customWrapper })
  expect(result.current.state.goalName).toBe('Pre-filled goal')
})

test('allActions flattens actions across all steps', () => {
  const steps = [
    { id: 's1', name: 'A', actions: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 's2', name: 'B', actions: [{ id: 'a3' }] },
  ]
  expect(allActions(steps).map(a => a.id)).toEqual(['a1', 'a2', 'a3'])
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- AppContext`
Expected: FAIL — `allActions` is not exported; `state.steps` is undefined.

- [ ] **Step 3: Modify `src/context/AppContext.jsx`**

Replace the `defaultState` constant and add the `allActions` export. The full file becomes:

```jsx
import { createContext, useContext, useState } from 'react'

const defaultState = {
  context: null,
  goalName: '',
  steps: [
    { id: 'step-1', name: '', actions: [] },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
}

const AppContext = createContext(null)

export function allActions(steps) {
  return steps.flatMap(s => s.actions)
}

export function AppProvider({ children, initialStateOverrides = {} }) {
  const [state, setState] = useState({ ...defaultState, ...initialStateOverrides })
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [fading, setFading] = useState(false)

  function goTo(screenId) {
    setFading(true)
    setTimeout(() => {
      setCurrentScreen(screenId)
      setFading(false)
    }, 150)
  }

  function updateState(updates) {
    setState(prev => ({ ...prev, ...updates }))
  }

  return (
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, updateState }}>
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

- [ ] **Step 4: Run AppContext tests to verify they pass**

Run: `npm test -- AppContext`
Expected: PASS — 7 tests.

- [ ] **Step 5: Rewrite `src/screens/GoalActions.test.jsx`**

Replace the entire file:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('starts with one empty expanded step: effort chips visible, nothing pre-filled', () => {
  renderWithApp(<GoalActions />)
  // chip is visible because the single step is expanded on load
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
  // no pre-seeded action card — "Write 400 words" exists only as the chip (one occurrence)
  expect(screen.getAllByText('Write 400 words')).toHaveLength(1)
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />)
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('Next is disabled until a goal name and at least one action exist', async () => {
  renderWithApp(<GoalActions />)
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(next()).toBeDisabled() // still no actions
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('tapping an effort chip adds it as an action in the step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByText('Practice 20 min'))
  // now present as both the chip and the action item → 2 occurrences
  expect(screen.getAllByText('Practice 20 min')).toHaveLength(2)
})

test('+ Add step adds a second step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByRole('button', { name: /add step/i }))
  expect(screen.getByText('Step 2')).toBeInTheDocument()
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 6: Run GoalActions tests to verify they fail**

Run: `npm test -- GoalActions`
Expected: FAIL — current GoalActions still renders the tab toggle and reads `state.actions`.

- [ ] **Step 7: Replace `src/screens/GoalActions.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import StepCard from '../components/StepCard'
import styles from './GoalActions.module.css'

let nextStep = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)
  const [steps, setSteps] = useState(state.steps)
  const [expandedId, setExpandedId] = useState(state.steps[0]?.id ?? null)

  function updateStep(stepId, updater) {
    setSteps(prev => prev.map(s => (s.id === stepId ? updater(s) : s)))
  }

  function renameStep(stepId, name) {
    updateStep(stepId, s => ({ ...s, name }))
  }

  function addAction(stepId, label, source) {
    updateStep(stepId, s => ({
      ...s,
      actions: [...s.actions, { id: `act-${nextAction++}`, label, source, completed: false }],
    }))
  }

  function removeAction(stepId, actionId) {
    updateStep(stepId, s => ({ ...s, actions: s.actions.filter(a => a.id !== actionId) }))
  }

  function addStep() {
    const id = `step-${nextStep++}`
    setSteps(prev => [...prev, { id, name: '', actions: [] }])
    setExpandedId(id)
  }

  function toggleStep(stepId) {
    setExpandedId(prev => (prev === stepId ? null : stepId))
  }

  function handleNext() {
    const pruned = steps.filter(s => s.actions.length > 0)
    updateState({ goalName, steps: pruned })
    goTo('cadence')
  }

  const canAdvance = goalName.trim().length > 0 && allActions(steps).length > 0

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>What are you working toward?</h1>

      <input
        className={styles.goalInput}
        type="text"
        placeholder="e.g. Finish my essay"
        value={goalName}
        onChange={e => setGoalName(e.target.value)}
      />

      <p className={styles.sectionLabel}>Break it into steps</p>
      <p className={styles.helper}>
        Optional — add as many as help, or keep just one. Describe each action by what you&apos;ll do.
      </p>

      <div className={styles.steps}>
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            position={i + 1}
            expanded={expandedId === step.id}
            onToggle={() => toggleStep(step.id)}
            onRename={name => renameStep(step.id, name)}
            onAddAction={(label, source) => addAction(step.id, label, source)}
            onRemoveAction={actionId => removeAction(step.id, actionId)}
          />
        ))}
      </div>

      <button type="button" className={styles.addStep} onClick={addStep}>
        + Add step
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

- [ ] **Step 8: Replace `src/screens/GoalActions.module.css`**

```css
.headline {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-6);
}

.goalInput {
  width: 100%;
  padding: 14px 16px;
  font-family: var(--font-body);
  font-size: 16px;
  border: 1.5px solid #ddd;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-7);
  outline: none;
  transition: border-color 0.15s;
}

.goalInput:focus {
  border-color: var(--color-purple);
}

.sectionLabel {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: var(--space-2);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-5);
  line-height: 1.5;
}

.steps {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

.addStep {
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

.addStep:hover {
  border-color: var(--color-purple);
}
```

- [ ] **Step 9: Run the full suite to verify green**

Run: `npm test`
Expected: PASS. AppContext (7) and GoalActions (7) pass on the new model; Recognition and ReturnView tests still pass because they seed their own state. (Live flow past Screen 03 is knowingly broken until Task 3 — tests do not cover that yet.)

- [ ] **Step 10: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: switch to steps model and rebuild Screen 02 as step accordion"
```

---

## Task 3: Recognition reads the first incomplete action across steps

**Files:**
- Modify: `src/screens/Recognition.jsx`
- Modify: `src/screens/Recognition.module.css`
- Modify: `src/screens/Recognition.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/Recognition.test.jsx`**

Replace the entire file:

```jsx
import { render, screen, act, fireEvent } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  steps: [
    { id: 'step-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('renders the first incomplete action as a CompleteControl', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('shows the step label when the owning step is named', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Research')).toBeInTheDocument()
})

test('omits the step label when the owning step is unnamed', () => {
  const unnamed = { ...seedState, steps: [{ id: 'step-1', name: '', actions: seedState.steps[0].actions }] }
  renderWithApp(<Recognition />, { initialStateOverrides: unnamed })
  expect(screen.queryByText('Research')).not.toBeInTheDocument()
})

test('picks the first INCOMPLETE action across steps', () => {
  const multi = {
    ...seedState,
    steps: [
      { id: 'step-1', name: 'Research', actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: true }] },
      { id: 'step-2', name: 'Draft', actions: [{ id: 'a2', label: 'Write 400 words', source: 'effort', completed: false }] },
    ],
  }
  renderWithApp(<Recognition />, { initialStateOverrides: multi })
  // the control targets the incomplete action
  expect(screen.getByRole('button', { name: /mark complete: write 400 words/i })).toBeInTheDocument()
})

test('shows default continue copy for non-when_i_can cadence', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'most_days' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See what tomorrow looks like/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('shows when_i_can continue copy when cadence is when_i_can', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'when_i_can' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See your home base/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('does not contain the word milestone', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run Recognition tests to verify they fail**

Run: `npm test -- Recognition`
Expected: FAIL — current code reads `state.actions` (undefined here) and has no step label.

- [ ] **Step 3: Replace `src/screens/Recognition.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [completed, setCompleted] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const flat = allActions(state.steps)
  // Freeze the target action on mount so completing it doesn't make the label
  // jump to the next incomplete action mid-screen.
  const [targetId] = useState(() => {
    const target = flat.find(a => !a.completed) || flat[0]
    return target ? target.id : null
  })
  const firstAction = flat.find(a => a.id === targetId) || flat[0]
  const ownerStep = state.steps.find(s => s.actions.some(a => a.id === firstAction.id))
  const stepLabel = ownerStep && ownerStep.name.trim() ? ownerStep.name.trim() : null

  function handleComplete() {
    const updatedSteps = state.steps.map(s => ({
      ...s,
      actions: s.actions.map(a => (a.id === firstAction.id ? { ...a, completed: true } : a)),
    }))
    updateState({ steps: updatedSteps })
    setCompleted(true)
    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      {stepLabel && <p className={styles.stepLabel}>{stepLabel}</p>}

      <CompleteControl
        actionId={firstAction.id}
        label={firstAction.label}
        completed={completed}
        onComplete={handleComplete}
      />

      <p className={styles.helper}>
        Tap to mark it done — this is the move you&apos;ll come back for.
      </p>

      {completed && (
        <div className={styles.peakMessage}>
          That&apos;s one done. This is how progress adds up.
        </div>
      )}

      {showContinue && (
        <button type="button" className={styles.continueBtn} onClick={() => goTo('return-view')}>
          {continueLabel}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Append `.stepLabel` to `src/screens/Recognition.module.css`**

Add this rule at the top of the file (leave the existing rules unchanged):

```css
.stepLabel {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-3);
}
```

- [ ] **Step 5: Run Recognition tests to verify they pass**

Run: `npm test -- Recognition`
Expected: PASS — 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Recognition.jsx src/screens/Recognition.module.css src/screens/Recognition.test.jsx
git commit -m "feat: Recognition surfaces first incomplete action across steps"
```

---

## Task 4: Return view groups actions under step headers

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Modify: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/ReturnView.test.jsx`**

Replace the entire file:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  steps: [
    { id: 'step-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: true },
      { id: 'act-2',  label: 'Read for 30 min',  source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
  supporters: [],
}

test('renders goal name prominently', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Finish my essay')).toBeInTheDocument()
})

test('shows "Welcome back." greeting', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Welcome back.')).toBeInTheDocument()
})

test('shows rhythm progress copy for non-when_i_can cadence', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/1 action done · keep it rolling/)).toBeInTheDocument()
})

test('shows cumulative progress copy for when_i_can cadence', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, cadence: 'when_i_can' } })
  expect(screen.getByText(/1 action done so far/)).toBeInTheDocument()
})

test('groups actions under a named step header with a per-step count', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
})

test('a single unnamed step renders flat (no step header or count)', () => {
  const flat = { ...baseState, steps: [{ id: 'step-1', name: '', actions: baseState.steps[0].actions }] }
  renderWithApp(<ReturnView />, { initialStateOverrides: flat })
  expect(screen.queryByText('1/2')).not.toBeInTheDocument()
  expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
  // actions still render
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('completed action is shown ticked (CompleteControl with completed=true)', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  const circles = document.querySelectorAll('[data-testid="complete-circle"]')
  const completedCircles = Array.from(circles).filter(el => el.className.includes('completed'))
  expect(completedCircles.length).toBeGreaterThanOrEqual(1)
})

test('does not show supporter section when supporters is empty', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.queryByText(/can cheer this on/i)).not.toBeInTheDocument()
})

test('shows supporter line (by name) when supporters is non-empty', () => {
  renderWithApp(<ReturnView />, {
    initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'single_goal' }] },
  })
  expect(screen.getByText(/Alex can cheer this on/i)).toBeInTheDocument()
})

test('shows soft re-offer when no supporters', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.getByText(/add someone to cheer you on/i)).toBeInTheDocument()
})

test('does not contain the word milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run ReturnView tests to verify they fail**

Run: `npm test -- ReturnView`
Expected: FAIL — current code reads `state.actions` and renders no step headers/counts.

- [ ] **Step 3: Replace `src/screens/ReturnView.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [steps, setSteps] = useState(state.steps)

  const flat = allActions(steps)
  const completedCount = flat.filter(a => a.completed).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = steps.map(s => ({
      ...s,
      actions: s.actions.map(a => (a.id === actionId ? { ...a, completed: true } : a)),
    }))
    setSteps(updated)
    updateState({ steps: updated })
  }

  const showHeaders = steps.length > 1 || steps.some(s => s.name.trim())
  const primarySupporterName = state.supporters[0]?.name || null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>

      <div className={styles.steps}>
        {steps.map((step, i) => {
          const done = step.actions.filter(a => a.completed).length
          return (
            <div key={step.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{step.name.trim() || `Step ${i + 1}`}</span>
                  <span className={styles.stepCount}>{done}/{step.actions.length}</span>
                </div>
              )}
              <div className={styles.actionList}>
                {step.actions.map(action => (
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
          )
        })}
      </div>

      {state.supporters.length > 0 ? (
        <p className={styles.supporterLine}>
          {primarySupporterName} can cheer this on.
        </p>
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
```

- [ ] **Step 4: Replace `src/screens/ReturnView.module.css`**

```css
.greeting {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 400;
  color: var(--color-body-gray);
  margin-bottom: var(--space-2);
}

.goalName {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-6);
}

.progress {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-purple);
  background: var(--color-purple-tint);
  padding: 10px 16px;
  border-radius: 12px;
  margin-bottom: var(--space-6);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stepGroup {
  display: flex;
  flex-direction: column;
}

.stepHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-3);
}

.stepCount {
  font-weight: 500;
  color: var(--color-body-gray);
}

.actionList {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.supporterLine {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-6);
}

.reOffer {
  display: block;
  width: 100%;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-body-gray);
  background: none;
  border: 1px dashed #ccc;
  border-radius: var(--radius-card);
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  margin-bottom: var(--space-6);
  transition: border-color 0.15s;
}

.reOffer:hover {
  border-color: var(--color-purple);
  color: var(--color-purple);
}
```

- [ ] **Step 5: Run the full suite to verify green**

Run: `npm test`
Expected: PASS across all files (AppContext, App, components, StepCard, Welcome, GoalActions, Cadence, OfferedSocial, Recognition, ReturnView).

- [ ] **Step 6: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: Return view groups actions under step headers with progress"
```

---

## Task 5: End-to-end verification

No code unless a defect surfaces. Confirms the live flow (broken mid-refactor) is whole again and the steps structure propagates.

**Files:**
- (verification only; commit any fixes you make)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all test files pass.

- [ ] **Step 2: Manual click-through in the browser**

Run: `npm run dev`, open `http://localhost:5173` at 390px width. Verify:
- Screen 02 loads with one empty, expanded step; effort chips visible; no pre-filled action; `Next` disabled.
- Type a goal; add a couple of effort actions via chips; tap `+ Add step`, name it, add an action; only one step is open at a time; `Next` enables once a goal + ≥1 action exist.
- Advance through Cadence → Offered social (skip) → Recognition: the "try it once" action is the first incomplete one; if its step is named, the step label shows above it; tapping it ticks green; continue copy honours cadence.
- Return view: actions are grouped under their step headers with `done/total` counts; a single unnamed step renders flat; completing an action ticks it green.
- "milestone" appears nowhere.

- [ ] **Step 3: Confirm the word "milestone" is absent from source**

Run: `npm test` (the per-screen `does not contain the word milestone` tests already assert this) and additionally spot-check by searching `src/` for the term — expect matches only inside test assertion strings.

- [ ] **Step 4: Commit any fixes**

If Steps 1–3 surfaced defects, fix them (re-running the relevant test first), then:

```bash
git add -A
git commit -m "fix: address issues found during step-breakdown end-to-end verification"
```

If nothing needed fixing, skip this commit.

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §3 layer name "Steps", proximal framing | StepCard header `Step N`, GoalActions positions, Recognition step label |
| §3 optional / progressive | One empty step on load; `+ Add step`; prune-empty on Next |
| §3 accordion, one open at a time | GoalActions `expandedId` + StepCard `expanded`/`onToggle` (Task 2) |
| §3 effort-only actions | StepCard `EFFORT_CHIPS` only; GoalActions "no outcome tab" test (Task 2) |
| §3 no pre-seeded action | AppContext default empty step; GoalActions "nothing pre-filled" test |
| §4 data model `steps[]` + `allActions` | Task 2 AppContext |
| §5 Screen 02 layout/interaction | Tasks 1–2 |
| §6 departures (no pre-seed, no outcome tab) | Tasks 1–2 tests assert absence |
| §7 Recognition first-incomplete + step label | Task 3 |
| §7 Return view grouping + per-step count + single-unnamed-flat | Task 4 |
| §8 testing (milestone guards retained) | every screen test keeps the milestone assertion |

**Type consistency:** action shape `{ id, label, source: 'effort'|'custom', completed }` and step shape `{ id, name, actions }` are used identically across `allActions`, StepCard, GoalActions, Recognition, ReturnView. `allActions(steps)` signature is consistent in all three screens. Callbacks `onAddAction(label, source)` / `onRemoveAction(actionId)` / `onRename(name)` / `onToggle()` match between StepCard and GoalActions.

**Placeholder scan:** none — every code and test step contains full content.
