# Cut Welcome + Step-Name Headline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the low-value Welcome screen (folding its framing into the goal screen and dropping `context` state), and reframe `StepCard` so the step name is an always-editable headline with a separate caret toggle.

**Architecture:** Four independent tasks, each leaving the full Vitest suite green. Task 1 removes Welcome and repoints the router/initial screen. Task 2 retriggers the Cadence reassurance off the locally-selected cadence. Task 3 rebuilds the goal-screen UI (StepCard name headline + caret; brand/subhead folded in). Task 4 verifies end-to-end.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. CSS-module class names are unhashed in tests (`generateScopedName: '[local]'`). Work directly on `main` (user consented).

Full design rationale: `docs/superpowers/specs/2026-05-27-welcome-cut-and-step-headline-design.md`.

---

## File structure

```
src/
├── App.jsx                     MODIFY — drop Welcome import + SCREENS entry
├── App.test.jsx                MODIFY — load asserts goal headline
├── context/
│   ├── AppContext.jsx          MODIFY — currentScreen → 'goal-actions'; remove context field
│   └── AppContext.test.jsx     MODIFY — defaults/currentScreen/goTo expectations
├── screens/
│   ├── Welcome.jsx             DELETE
│   ├── Welcome.module.css      DELETE
│   ├── Welcome.test.jsx        DELETE
│   ├── Cadence.jsx             MODIFY — reassurance on local cadence === 'when_i_can'
│   ├── Cadence.test.jsx        MODIFY — cadence-based reassurance tests
│   ├── GoalActions.jsx         MODIFY — brand + subhead; drop position prop
│   ├── GoalActions.module.css  MODIFY — add .brand, .subhead
│   └── GoalActions.test.jsx    MODIFY — subhead + editable-name + add-step fix
└── components/
    ├── StepCard.jsx            MODIFY — name input headline + caret toggle
    ├── StepCard.module.css     MODIFY — header row (input + caret)
    └── StepCard.test.jsx       MODIFY — name-input + caret tests
```

Tasks are independent and any order leaves tests green; implement 1 → 4 as written.

---

## Task 1: Remove the Welcome screen

**Files:**
- Delete: `src/screens/Welcome.jsx`, `src/screens/Welcome.module.css`, `src/screens/Welcome.test.jsx`
- Modify: `src/App.jsx`, `src/App.test.jsx`, `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`

- [ ] **Step 1: Rewrite `src/App.test.jsx`**

Replace the ENTIRE file:

```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the goal screen on load', () => {
  render(<App />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('does not contain the word "milestone" anywhere on initial load', () => {
  render(<App />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Rewrite `src/context/AppContext.test.jsx`**

Replace the ENTIRE file:

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

test('initial state has correct defaults (no context field)', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state).not.toHaveProperty('context')
  expect(state.goalName).toBe('')
  expect(state.cadence).toBe('few_times_week')
  expect(state.cadenceDays).toEqual([])
  expect(state.supporters).toEqual([])
})

test('currentScreen starts at goal-actions', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('goal-actions')
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
  expect(result.current.currentScreen).toBe('goal-actions') // old screen during fade
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

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- App AppContext`
Expected: FAIL — App still loads Welcome ("What's pulling..."), AppContext still has `context` and `currentScreen: 'welcome'`.

- [ ] **Step 4: Delete the Welcome files**

Run:
```bash
git rm src/screens/Welcome.jsx src/screens/Welcome.module.css src/screens/Welcome.test.jsx
```

- [ ] **Step 5: Replace `src/App.jsx`**

```jsx
import { AppProvider, useApp } from './context/AppContext'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import ReturnView from './screens/ReturnView'
import styles from './App.module.css'

const SCREENS = {
  'goal-actions':   GoalActions,
  'cadence':        Cadence,
  'offered-social': OfferedSocial,
  'recognition':    Recognition,
  'return-view':    ReturnView,
}

function Router() {
  const { currentScreen, fading } = useApp()
  const Screen = SCREENS[currentScreen]
  return (
    <div className={`screenWrapper ${fading ? 'fading' : ''}`}>
      <Screen />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
```

- [ ] **Step 6: Modify `src/context/AppContext.jsx`**

Replace the `defaultState` const (remove the `context` line) and change the `currentScreen` initial value. The full file becomes:

```jsx
import { createContext, useContext, useState } from 'react'

const defaultState = {
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
  const [currentScreen, setCurrentScreen] = useState('goal-actions')
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

- [ ] **Step 7: Run the full suite to verify green**

Run: `npm test`
Expected: PASS. Cadence tests still pass because they seed `context` explicitly in `initialStateOverrides` and `Cadence.jsx` still reads `state.context` (changed in Task 2).

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: remove Welcome screen; goal screen is now the entry point"
```

---

## Task 2: Retrigger Cadence reassurance on "Whenever I can"

**Files:**
- Modify: `src/screens/Cadence.jsx`
- Modify: `src/screens/Cadence.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/Cadence.test.jsx`**

Replace the ENTIRE file:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Cadence from './Cadence'

test('renders headline verbatim', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText('How often feels realistic?')).toBeInTheDocument()
})

test('renders all four cadence options', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText('A few times a week')).toBeInTheDocument()
  expect(screen.getByText('Most days')).toBeInTheDocument()
  expect(screen.getByText('Specific days')).toBeInTheDocument()
  expect(screen.getByText('Whenever I can')).toBeInTheDocument()
})

test('"Specific days" reveals day picker when selected', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Specific days'))
  expect(screen.getByText('Mon')).toBeInTheDocument()
})

test('day picker does not appear when another option is selected', () => {
  renderWithApp(<Cadence />)
  expect(screen.queryByText('Mon')).not.toBeInTheDocument()
})

test('shows reassurance when "Whenever I can" is selected', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Whenever I can'))
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('shows reassurance when cadence is seeded as when_i_can', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { cadence: 'when_i_can' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('does not show reassurance for the default cadence', () => {
  renderWithApp(<Cadence />)
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})

test('does not show reassurance after selecting "Most days"', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Most days'))
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm test -- Cadence`
Expected: FAIL — `Cadence.jsx` still keys reassurance off `state.context`, so selecting "Whenever I can" shows nothing.

- [ ] **Step 3: Modify `src/screens/Cadence.jsx`**

Change ONLY the `showReassurance` line (line 21). Replace:

```jsx
  const showReassurance = state.context === 'both' || state.context === 'life_full'
```

with:

```jsx
  const showReassurance = cadence === 'when_i_can'
```

Leave the rest of the file unchanged. (`cadence` is the local state `const [cadence, setCadence] = useState(state.cadence)`, so the reassurance reacts live as options are tapped.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Cadence`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Cadence.jsx src/screens/Cadence.test.jsx
git commit -m "feat: trigger Cadence reassurance on 'Whenever I can' cadence"
```

---

## Task 3: Goal screen — folded framing + step-name headline

**Files:**
- Modify: `src/components/StepCard.jsx`
- Modify: `src/components/StepCard.module.css`
- Modify: `src/components/StepCard.test.jsx`
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.module.css`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Rewrite `src/components/StepCard.test.jsx`**

Replace the ENTIRE file:

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
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    ...overrides,
  }
  return render(<StepCard {...props} />)
}

test('renders an editable name input as the headline', () => {
  renderCard({ step: emptyStep })
  expect(screen.getByRole('textbox', { name: /step name/i })).toBeInTheDocument()
})

test('the name input reflects the step name', () => {
  renderCard({ step: filledStep })
  expect(screen.getByRole('textbox', { name: /step name/i })).toHaveValue('Research')
})

test('shows the placeholder when the name is empty', () => {
  renderCard({ step: emptyStep })
  expect(screen.getByPlaceholderText(/name this step/i)).toBeInTheDocument()
})

test('editing the name input calls onRename', async () => {
  const onRename = vi.fn()
  renderCard({ onRename })
  await userEvent.type(screen.getByRole('textbox', { name: /step name/i }), 'R')
  expect(onRename).toHaveBeenCalled()
})

test('the caret button calls onToggle', async () => {
  const onToggle = vi.fn()
  renderCard({ onToggle, expanded: false })
  await userEvent.click(screen.getByRole('button', { name: /show actions/i }))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('collapsed card hides the effort chips but keeps the name input', () => {
  renderCard({ expanded: false })
  expect(screen.queryByText('Write 400 words')).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /step name/i })).toBeInTheDocument()
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

test('does not contain the word milestone', () => {
  renderCard({ step: filledStep, expanded: true })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run StepCard tests to verify they fail**

Run: `npm test -- StepCard`
Expected: FAIL — current StepCard has a header *button* (no `textbox`, no "Show actions" caret).

- [ ] **Step 3: Replace `src/components/StepCard.jsx`**

```jsx
import { useState } from 'react'
import styles from './StepCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

export default function StepCard({ step, expanded, onToggle, onRename, onAddAction, onRemoveAction }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

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
      <div className={styles.header}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Name this step — e.g. Research"
          value={step.name}
          onChange={e => onRename(e.target.value)}
          aria-label="Step name"
        />
        <button
          type="button"
          className={styles.caret}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide actions' : 'Show actions'}
          onClick={onToggle}
        >
          {expanded ? '▾' : '▸'}
        </button>
      </div>

      {expanded && (
        <div className={styles.body}>
          {step.actions.length > 0 && (
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

- [ ] **Step 4: Replace `src/components/StepCard.module.css`**

```css
.card {
  border: 1.5px solid #e6e0ff;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-purple-tint);
  padding: 8px 10px 8px 14px;
}

.nameInput {
  flex: 1;
  background: none;
  border: none;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-purple);
  outline: none;
  padding: 4px 0;
}

.nameInput::placeholder {
  color: var(--color-body-gray);
  font-weight: 500;
}

.caret {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-purple);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 8px;
  line-height: 1;
}

.body {
  padding: 12px 14px;
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

- [ ] **Step 5: Run StepCard tests to verify they pass**

Run: `npm test -- StepCard`
Expected: PASS — 10 tests.

- [ ] **Step 6: Rewrite `src/screens/GoalActions.test.jsx`**

Replace the ENTIRE file:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('renders the folded-in value-prop subhead', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('starts with one empty expanded step: effort chips visible, nothing pre-filled', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
  expect(screen.getAllByText('Write 400 words')).toHaveLength(1)
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />)
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('the step name is directly editable', async () => {
  renderWithApp(<GoalActions />)
  const nameInput = screen.getByPlaceholderText(/name this step/i)
  await userEvent.type(nameInput, 'Research')
  expect(nameInput).toHaveValue('Research')
})

test('Next is disabled until a goal name and at least one action exist', async () => {
  renderWithApp(<GoalActions />)
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(next()).toBeDisabled()
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('tapping an effort chip adds it as an action in the step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByText('Practice 20 min'))
  expect(screen.getAllByText('Practice 20 min')).toHaveLength(2)
})

test('+ Add step adds a second step (two name inputs)', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByRole('button', { name: /add step/i }))
  expect(screen.getAllByPlaceholderText(/name this step/i)).toHaveLength(2)
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 7: Run GoalActions tests to verify the new ones fail**

Run: `npm test -- GoalActions`
Expected: FAIL — the "renders the folded-in value-prop subhead" test fails (the old GoalActions has no subhead). The name-input / add-step assertions may already pass because the rewritten StepCard (Steps 3–4) already supplies the name inputs; the subhead is the genuine red here.

- [ ] **Step 8: Replace `src/screens/GoalActions.jsx`**

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
      <div className={styles.brand}>Huddel</div>
      <h1 className={styles.headline}>What are you working toward?</h1>
      <p className={styles.subhead}>
        Huddel plans around real life — so your goals bend when your week does.
      </p>

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
        {steps.map(step => (
          <StepCard
            key={step.id}
            step={step}
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

- [ ] **Step 9: Update `src/screens/GoalActions.module.css`**

Add `.brand` and `.subhead`, and reduce the `.headline` bottom margin so the subhead sits close. Replace the existing `.headline` rule and INSERT the two new rules immediately after it. The top of the file becomes:

```css
.brand {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-7);
  text-align: center;
}

.headline {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-3);
}

.subhead {
  font-size: 15px;
  color: var(--color-body-gray);
  line-height: 1.5;
  margin-bottom: var(--space-7);
}
```

Leave all other rules (`.goalInput`, `.sectionLabel`, `.helper`, `.steps`, `.addStep`) unchanged.

- [ ] **Step 10: Run the full suite to verify green**

Run: `npm test`
Expected: PASS across all files (App, AppContext, components, StepCard, GoalActions, Cadence, OfferedSocial, Recognition, ReturnView).

- [ ] **Step 11: Commit**

```bash
git add src/components/StepCard.jsx src/components/StepCard.module.css src/components/StepCard.test.jsx src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: step name as editable headline; fold framing into goal screen"
```

---

## Task 4: End-to-end verification

No code unless a defect surfaces.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all files pass.

- [ ] **Step 2: Production build check**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 3: Manual click-through in the browser**

Run `npm run dev`, open `http://localhost:5173` at 390px. Verify:
- App opens directly on the goal screen (no Welcome) with the "Huddel" brand and the "plans around real life" subhead.
- The step card shows an editable name field as its headline; typing renames it live; the caret expands/collapses the actions.
- Add a couple of actions, add a second step, name them; advance.
- On Cadence, the "Smart pick — irregular weeks…" line appears only when "Whenever I can" is selected.
- Recognition and Return view still work and reflect the steps.
- "milestone" appears nowhere.

- [ ] **Step 4: Confirm "milestone" absent from source**

Run: `npm test` (the per-screen guards assert this). Spot-check `src/` — matches only in test assertion strings.

- [ ] **Step 5: Commit any fixes**

If Steps 1–4 surfaced defects, fix them (re-running the relevant test first), then commit. If nothing needed fixing, skip this commit.

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §3 remove Welcome (files, App.jsx, currentScreen, context) | Task 1 |
| §4 fold brand + subhead into goal screen | Task 3 (Steps 8–9) |
| §5 StepCard name headline + caret toggle | Task 3 (Steps 3–4) |
| §5 name not strictly required / single-unnamed-flat unchanged | GoalActions Next gating unchanged; downstream untouched |
| §6 Cadence reassurance on local `cadence === 'when_i_can'` | Task 2 |
| §7 test updates (delete Welcome.test, App/AppContext/Cadence/StepCard/GoalActions) | Tasks 1–3 |
| §8 traceability note | Recorded in the spec |

**Type/interface consistency:** `StepCard` props are now `{ step, expanded, onToggle, onRename, onAddAction, onRemoveAction }` — `position` removed from both the component and its only caller (GoalActions Step 8). Callbacks unchanged in shape. `step` shape `{ id, name, actions }` unchanged. `allActions` usage unchanged.

**Placeholder scan:** none — every code and test step has full content.

**Green-between-tasks:** Task 1 leaves Cadence tests green (they seed `context`, and `Cadence.jsx` still reads it until Task 2). Task 2 removes the last `context` reader. Task 3's StepCard rewrite and GoalActions update ship together (Steps 1–11) so the add-step assertion and the name-input headline never disagree.
