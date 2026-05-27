# Two-Page Goal Flow + Milestones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the goal step into two pages (set the goal → break it down), reintroduce "Milestones" as the proximal sub-goal layer that nests effort-based actions, add subtle cited science notes across screens, and reframe the A2 thesis.

**Architecture:** Six tasks, each leaving the Vitest suite green. A new `GoalSetup` screen (Page 1) becomes the entry point; `GoalActions` becomes the breakdown page (Page 2); `StepCard`→`MilestoneCard` and the state field `steps`→`milestones` are renamed; Recognition/ReturnView consume `milestones`; a shared `.scienceNote` global class carries cited microcopy. The `does not contain the word milestone` guard tests are removed (milestone is now intended).

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. CSS-module class names are unhashed in tests; `screenPad`/`bottomActions`/`scienceNote` are GLOBAL classes (plain strings, not `styles.*`). Work directly on `main` (user consented).

Full design + research basis: `docs/superpowers/specs/2026-05-27-two-page-goal-flow-and-milestones-design.md`.

---

## File structure

```
src/
├── App.jsx                       MODIFY — add 'goal' → GoalSetup
├── App.test.jsx                  MODIFY — load asserts GoalSetup; drop milestone guard
├── styles/global.css             MODIFY — add .scienceNote utility
├── context/
│   ├── AppContext.jsx            MODIFY — currentScreen 'goal'; steps→milestones
│   └── AppContext.test.jsx       MODIFY
├── screens/
│   ├── GoalSetup.jsx             CREATE — Page 1 (set the goal)
│   ├── GoalSetup.module.css      CREATE
│   ├── GoalSetup.test.jsx        CREATE
│   ├── GoalActions.jsx           MODIFY — Page 2 breakdown (milestones)
│   ├── GoalActions.module.css    MODIFY
│   ├── GoalActions.test.jsx      MODIFY
│   ├── Cadence.jsx               MODIFY — add science note
│   ├── Cadence.test.jsx          MODIFY — assert note
│   ├── Recognition.jsx           MODIFY — milestones + science note
│   ├── Recognition.test.jsx      MODIFY
│   ├── ReturnView.jsx            MODIFY — milestones + science note
│   └── ReturnView.test.jsx       MODIFY
├── components/
│   ├── StepCard.jsx → MilestoneCard.jsx          RENAME + edit
│   ├── StepCard.module.css → MilestoneCard.module.css   RENAME
│   └── StepCard.test.jsx → MilestoneCard.test.jsx       RENAME + rewrite
specs/00_README.md                MODIFY — reframe spine + rule #1
specs/99_state_and_navigation.md  MODIFY — update demo-readiness milestone item
```

**Sequencing note:** Task 2 renames the shared state field `steps`→`milestones` and rebuilds Page 2. Between Task 2 and Tasks 3–4 the *unit suite stays green* (Recognition/ReturnView tests seed their own state and their code still reads the old field until migrated), but the *live* flow past Cadence is temporarily broken. Expected; Task 6 verifies the whole flow. Implement 1 → 6 in order.

---

## Task 1: Page 1 (GoalSetup) + routing + science-note utility

**Files:**
- Create: `src/screens/GoalSetup.jsx`, `GoalSetup.module.css`, `GoalSetup.test.jsx`
- Modify: `src/styles/global.css`, `src/App.jsx`, `src/App.test.jsx`, `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`

- [ ] **Step 1: Add the `.scienceNote` utility to `src/styles/global.css`**

Append to the end of `src/styles/global.css`:

```css
/* ── Utility: cited science note (subtle, never competes with primary content) ── */
.scienceNote {
  font-size: 12px;
  font-style: italic;
  color: var(--color-body-gray);
  line-height: 1.4;
  margin-top: var(--space-2);
  margin-bottom: var(--space-5);
}
```

- [ ] **Step 2: Write `src/screens/GoalSetup.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalSetup from './GoalSetup'

test('renders brand, headline, and value-prop subhead', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByText('Huddel')).toBeInTheDocument()
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('renders the goal input with a specificity helper', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByPlaceholderText(/pass ifn637/i)).toBeInTheDocument()
  expect(screen.getByText(/Be specific and make it yours/)).toBeInTheDocument()
})

test('renders the Locke & Latham science note', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByText(/Locke & Latham/)).toBeInTheDocument()
})

test('Continue is disabled until a goal name is entered', async () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/pass ifn637/i), 'Pass IFN637')
  expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- GoalSetup`
Expected: FAIL — `Cannot find module './GoalSetup'`.

- [ ] **Step 4: Create `src/screens/GoalSetup.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import styles from './GoalSetup.module.css'

export default function GoalSetup() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)

  function handleContinue() {
    updateState({ goalName })
    goTo('goal-actions')
  }

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
        placeholder="e.g. Pass IFN637"
        value={goalName}
        onChange={e => setGoalName(e.target.value)}
      />
      <p className={styles.helper}>
        Be specific and make it yours — &ldquo;Pass IFN637&rdquo;, not &ldquo;do better&rdquo;.
      </p>
      <p className="scienceNote">
        Specific, meaningful goals are pursued harder. — Locke &amp; Latham, 2002
      </p>

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue} disabled={!goalName.trim()}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/screens/GoalSetup.module.css`**

```css
.brand {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-9);
  text-align: center;
}

.headline {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-5);
}

.subhead {
  font-size: 16px;
  color: var(--color-body-gray);
  line-height: 1.5;
  margin-bottom: var(--space-8);
}

.goalInput {
  width: 100%;
  padding: 14px 16px;
  font-family: var(--font-body);
  font-size: 16px;
  border: 1.5px solid #ddd;
  border-radius: var(--radius-card);
  outline: none;
  transition: border-color 0.15s;
}

.goalInput:focus {
  border-color: var(--color-purple);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  line-height: 1.5;
  margin-top: var(--space-3);
}
```

- [ ] **Step 6: Run GoalSetup tests to verify they pass**

Run: `npm test -- GoalSetup`
Expected: PASS — 4 tests.

- [ ] **Step 7: Rewrite `src/App.jsx`** (add the `'goal'` route)

```jsx
import { AppProvider, useApp } from './context/AppContext'
import GoalSetup from './screens/GoalSetup'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import ReturnView from './screens/ReturnView'
import styles from './App.module.css'

const SCREENS = {
  'goal':           GoalSetup,
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

- [ ] **Step 8: Rewrite `src/App.test.jsx`** (load is now GoalSetup; drop the milestone guard)

```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the goal-setup screen on load', () => {
  render(<App />)
  expect(screen.getByText('Huddel')).toBeInTheDocument()
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})
```

- [ ] **Step 9: Modify `src/context/AppContext.jsx`** — change ONLY the `currentScreen` initial value from `'goal-actions'` to `'goal'`:

```jsx
  const [currentScreen, setCurrentScreen] = useState('goal')
```

Leave everything else (including the `steps` default — renamed in Task 2) unchanged.

- [ ] **Step 10: Update `src/context/AppContext.test.jsx`** — change the two `currentScreen` expectations to `'goal'`. The "currentScreen starts" test:

```jsx
test('currentScreen starts at goal', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('goal')
})
```

And in the `goTo` test, change the "old screen during fade" expectation:

```jsx
  act(() => { result.current.goTo('cadence') })
  expect(result.current.currentScreen).toBe('goal') // old screen during fade
```

Leave all other AppContext tests unchanged (the `steps` default test is renamed in Task 2).

- [ ] **Step 11: Run the full suite to verify green**

Run: `npm test`
Expected: PASS. (GoalActions still has its own goal input and reads `state.steps` — redundant but harmless; cleaned in Task 2.)

- [ ] **Step 12: Commit**

```bash
git add src/screens/GoalSetup.jsx src/screens/GoalSetup.module.css src/screens/GoalSetup.test.jsx src/styles/global.css src/App.jsx src/App.test.jsx src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: add Page 1 goal-setup screen as the new entry point"
```

---

## Task 2: Page 2 (GoalActions breakdown) + MilestoneCard + state rename

**Files:**
- Rename: `src/components/StepCard.jsx` → `MilestoneCard.jsx`, `StepCard.module.css` → `MilestoneCard.module.css`, `StepCard.test.jsx` → `MilestoneCard.test.jsx`
- Modify: `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`, `src/screens/GoalActions.jsx`, `src/screens/GoalActions.module.css`, `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Rename the StepCard files (preserve history)**

Run:
```bash
git mv src/components/StepCard.jsx src/components/MilestoneCard.jsx
git mv src/components/StepCard.module.css src/components/MilestoneCard.module.css
git mv src/components/StepCard.test.jsx src/components/MilestoneCard.test.jsx
```

- [ ] **Step 2: Rewrite `src/components/MilestoneCard.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MilestoneCard from './MilestoneCard'

const emptyMilestone = { id: 'm1', name: '', actions: [] }
const filledMilestone = {
  id: 'm1',
  name: 'Research',
  actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }],
}

const noop = () => {}

function renderCard(overrides = {}) {
  const props = {
    milestone: emptyMilestone,
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    ...overrides,
  }
  return render(<MilestoneCard {...props} />)
}

test('renders an editable name input as the headline', () => {
  renderCard({ milestone: emptyMilestone })
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toBeInTheDocument()
})

test('the name input reflects the milestone name', () => {
  renderCard({ milestone: filledMilestone })
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toHaveValue('Research')
})

test('shows the placeholder when the name is empty', () => {
  renderCard({ milestone: emptyMilestone })
  expect(screen.getByPlaceholderText(/name this milestone/i)).toBeInTheDocument()
})

test('editing the name input calls onRename', async () => {
  const onRename = vi.fn()
  renderCard({ onRename })
  await userEvent.type(screen.getByRole('textbox', { name: /milestone name/i }), 'R')
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
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toBeInTheDocument()
})

test('expanded card shows effort chips and adds an effort action on tap', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onAddAction).toHaveBeenCalledWith('Write 400 words', 'effort')
})

test('expanded card lists existing actions and removes them', async () => {
  const onRemoveAction = vi.fn()
  renderCard({ milestone: filledMilestone, expanded: true, onRemoveAction })
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

test('expanded card shows the Pham & Taylor science note', () => {
  renderCard({ expanded: true })
  expect(screen.getByText(/Pham & Taylor/)).toBeInTheDocument()
})
```

- [ ] **Step 3: Run MilestoneCard tests to verify they fail**

Run: `npm test -- MilestoneCard`
Expected: FAIL — the moved file still uses the `step` prop / "Step name" aria-label and has no science note.

- [ ] **Step 4: Replace `src/components/MilestoneCard.jsx`**

```jsx
import { useState } from 'react'
import styles from './MilestoneCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

export default function MilestoneCard({ milestone, expanded, onToggle, onRename, onAddAction, onRemoveAction }) {
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
          placeholder="Name this milestone — e.g. Research"
          value={milestone.name}
          onChange={e => onRename(e.target.value)}
          aria-label="Milestone name"
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
          {milestone.actions.length > 0 && (
            <ul className={styles.actionList}>
              {milestone.actions.map(action => (
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
          <p className="scienceNote">Describe what you&apos;ll do, not the finish line. — Pham &amp; Taylor, 1999</p>
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

(The `import styles from './MilestoneCard.module.css'` path is updated; the `.module.css` content is unchanged from the renamed StepCard file — no edits needed there.)

- [ ] **Step 5: Run MilestoneCard tests to verify they pass**

Run: `npm test -- MilestoneCard`
Expected: PASS — 10 tests.

- [ ] **Step 6: Modify `src/context/AppContext.jsx`** — rename the state field `steps` → `milestones` and the `allActions` param. The full file becomes:

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

- [ ] **Step 7: Update the milestone-shape tests in `src/context/AppContext.test.jsx`**

Replace the "initial state has one empty step" test and the "allActions" test with:

```jsx
test('initial state has one empty milestone', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.milestones).toHaveLength(1)
  expect(result.current.state.milestones[0].name).toBe('')
  expect(result.current.state.milestones[0].actions).toEqual([])
})
```

```jsx
test('allActions flattens actions across all milestones', () => {
  const milestones = [
    { id: 'm1', name: 'A', actions: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 'm2', name: 'B', actions: [{ id: 'a3' }] },
  ]
  expect(allActions(milestones).map(a => a.id)).toEqual(['a1', 'a2', 'a3'])
})
```

Leave the other tests (defaults, currentScreen 'goal', updateState, goTo, initialStateOverrides) unchanged.

- [ ] **Step 8: Rewrite `src/screens/GoalActions.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

const seed = { goalName: 'Finish my essay' }

test('shows the goal name and a back-to-goal affordance', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Finish my essay')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /edit goal/i })).toBeInTheDocument()
})

test('renders the "Break it into milestones" section', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Break it into milestones')).toBeInTheDocument()
})

test('renders the Bandura & Schunk science note', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText(/Bandura & Schunk/)).toBeInTheDocument()
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('the milestone name is directly editable', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  const nameInput = screen.getByPlaceholderText(/name this milestone/i)
  await userEvent.type(nameInput, 'Research')
  expect(nameInput).toHaveValue('Research')
})

test('Next is disabled until at least one action exists', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('+ Add milestone adds a second milestone', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByRole('button', { name: /add milestone/i }))
  expect(screen.getAllByPlaceholderText(/name this milestone/i)).toHaveLength(2)
})
```

- [ ] **Step 9: Run GoalActions tests to verify they fail**

Run: `npm test -- GoalActions`
Expected: FAIL — current GoalActions reads `state.steps`, imports StepCard, has a goal input + "Break it into steps".

- [ ] **Step 10: Replace `src/screens/GoalActions.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import MilestoneCard from '../components/MilestoneCard'
import styles from './GoalActions.module.css'

let nextMilestone = 2
let nextAction = 100

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
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

  const canAdvance = allActions(milestones).length > 0

  return (
    <div className="screenPad">
      <button type="button" className={styles.back} onClick={() => goTo('goal')}>← Edit goal</button>
      <h1 className={styles.goalHeading}>{state.goalName}</h1>

      <p className={styles.sectionLabel}>Break it into milestones</p>
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

- [ ] **Step 11: Replace `src/screens/GoalActions.module.css`**

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

.goalHeading {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-6);
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

- [ ] **Step 12: Run the full suite to verify green**

Run: `npm test`
Expected: PASS. AppContext + GoalActions + MilestoneCard now on the milestones model; Recognition and ReturnView tests still pass (they seed their own `steps` state and their code is unchanged — migrated in Tasks 3–4). Live flow past Cadence is knowingly broken until then.

- [ ] **Step 13: Commit**

```bash
git add src/components/MilestoneCard.jsx src/components/MilestoneCard.module.css src/components/MilestoneCard.test.jsx src/context/AppContext.jsx src/context/AppContext.test.jsx src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: rebuild Page 2 as milestone breakdown; rename steps→milestones"
```

---

## Task 3: Recognition reads milestones + science note

**Files:**
- Modify: `src/screens/Recognition.jsx`, `src/screens/Recognition.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/Recognition.test.jsx`**

```jsx
import { render, screen, act, fireEvent } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
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

test('shows the milestone label when the owning milestone is named', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Research')).toBeInTheDocument()
})

test('omits the milestone label when the owning milestone is unnamed', () => {
  const unnamed = { ...seedState, milestones: [{ id: 'milestone-1', name: '', actions: seedState.milestones[0].actions }] }
  renderWithApp(<Recognition />, { initialStateOverrides: unnamed })
  expect(screen.queryByText('Research')).not.toBeInTheDocument()
})

test('picks the first INCOMPLETE action across milestones', () => {
  const multi = {
    ...seedState,
    milestones: [
      { id: 'm1', name: 'Research', actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: true }] },
      { id: 'm2', name: 'Draft', actions: [{ id: 'a2', label: 'Write 400 words', source: 'effort', completed: false }] },
    ],
  }
  renderWithApp(<Recognition />, { initialStateOverrides: multi })
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

test('shows the Bandura & Schunk science note after completing', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  expect(screen.getByText(/builds the confidence/i)).toBeInTheDocument()
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run Recognition tests to verify they fail**

Run: `npm test -- Recognition`
Expected: FAIL — current code reads `state.steps` and has no science note.

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

  const flat = allActions(state.milestones)
  const [targetId] = useState(() => {
    const target = flat.find(a => !a.completed) || flat[0]
    return target ? target.id : null
  })
  const firstAction = flat.find(a => a.id === targetId) || flat[0]
  const ownerMilestone = state.milestones.find(m => m.actions.some(a => a.id === firstAction.id))
  const milestoneLabel = ownerMilestone && ownerMilestone.name.trim() ? ownerMilestone.name.trim() : null

  function handleComplete() {
    const updatedMilestones = state.milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === firstAction.id ? { ...a, completed: true } : a)),
    }))
    updateState({ milestones: updatedMilestones })
    setCompleted(true)
    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      {milestoneLabel && <p className={styles.stepLabel}>{milestoneLabel}</p>}

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

      {completed && (
        <p className="scienceNote">Finishing one small action builds the confidence that drives the next. — Bandura &amp; Schunk, 1981</p>
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

(The `.stepLabel` CSS class in `Recognition.module.css` is reused as-is for the milestone label — no CSS change needed.)

- [ ] **Step 4: Run Recognition tests to verify they pass**

Run: `npm test -- Recognition`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Recognition.jsx src/screens/Recognition.test.jsx
git commit -m "feat: Recognition reads milestones; add progress science note"
```

---

## Task 4: ReturnView groups by milestones + science note

**Files:**
- Modify: `src/screens/ReturnView.jsx`, `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/ReturnView.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
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

test('groups actions under a named milestone header with a per-milestone count', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
})

test('a single unnamed milestone renders flat (no header or count)', () => {
  const flat = { ...baseState, milestones: [{ id: 'milestone-1', name: '', actions: baseState.milestones[0].actions }] }
  renderWithApp(<ReturnView />, { initialStateOverrides: flat })
  expect(screen.queryByText('1/2')).not.toBeInTheDocument()
  expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument()
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('completed action is shown ticked', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  const circles = document.querySelectorAll('[data-testid="complete-circle"]')
  const completedCircles = Array.from(circles).filter(el => el.className.includes('completed'))
  expect(completedCircles.length).toBeGreaterThanOrEqual(1)
})

test('shows supporter line by name when supporters is non-empty', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'single_goal' }] } })
  expect(screen.getByText(/Alex can cheer this on/i)).toBeInTheDocument()
})

test('shows soft re-offer when no supporters', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.getByText(/add someone to cheer you on/i)).toBeInTheDocument()
})

test('renders the Bandura & Schunk progress science note', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/near-term progress sustains/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run ReturnView tests to verify they fail**

Run: `npm test -- ReturnView`
Expected: FAIL — current code reads `state.steps`, uses "Step N" headers, has no science note.

- [ ] **Step 3: Replace `src/screens/ReturnView.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)

  const flat = allActions(milestones)
  const completedCount = flat.filter(a => a.completed).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, completed: true } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const primarySupporterName = state.supporters[0]?.name || null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>
      <p className="scienceNote">Seeing near-term progress sustains motivation. — Bandura &amp; Schunk, 1981</p>

      <div className={styles.steps}>
        {milestones.map((milestone, i) => {
          const done = milestone.actions.filter(a => a.completed).length
          return (
            <div key={milestone.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{milestone.name.trim() || `Milestone ${i + 1}`}</span>
                  <span className={styles.stepCount}>{done}/{milestone.actions.length}</span>
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

(The `styles.steps`/`stepGroup`/`stepHeader`/`stepCount` CSS classes are reused as-is — no CSS change needed.)

- [ ] **Step 4: Run ReturnView tests to verify they pass**

Run: `npm test -- ReturnView`
Expected: PASS — 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.test.jsx
git commit -m "feat: Return view groups by milestones; add progress science note"
```

---

## Task 5: Cadence science note

**Files:**
- Modify: `src/screens/Cadence.jsx`, `src/screens/Cadence.test.jsx`

- [ ] **Step 1: Add a test to `src/screens/Cadence.test.jsx`**

Append this test to the end of the file:

```jsx
test('renders the Locke & Latham science note', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText(/Locke & Latham/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run Cadence tests to verify the new one fails**

Run: `npm test -- Cadence`
Expected: FAIL — the science note isn't rendered yet.

- [ ] **Step 3: Modify `src/screens/Cadence.jsx`**

Insert the science note immediately after the existing helper paragraph. Find:

```jsx
      <p className={styles.helper}>No wrong answer. You can change this whenever your week changes.</p>
```

and add the note line right after it:

```jsx
      <p className={styles.helper}>No wrong answer. You can change this whenever your week changes.</p>
      <p className="scienceNote">A cadence you&apos;ll actually keep protects commitment. — Locke &amp; Latham, 2002</p>
```

Leave the rest of the file unchanged.

- [ ] **Step 4: Run Cadence tests to verify they pass**

Run: `npm test -- Cadence`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Cadence.jsx src/screens/Cadence.test.jsx
git commit -m "feat: add commitment science note to Cadence"
```

---

## Task 6: Reframe the A2 thesis + end-to-end verification

**Files:**
- Modify: `specs/00_README.md`, `specs/99_state_and_navigation.md`
- Verification only for `src/`

- [ ] **Step 1: Reframe the one-sentence spine in `specs/00_README.md`**

Find the existing spine blockquote (begins "Huddel was asking users to set outcome-based") and replace the whole blockquote with:

```markdown
> *Huddel's original onboarding set outcome-based milestones with no controllable effort layer and no schedule flexibility, so this cohort — students juggling work and study — stalled when a week blew up. This redesign keeps **proximal milestones** (Bandura & Schunk 1981 — they drive momentum and self-efficacy) but nests **effort-based actions** beneath them as the recognised unit of progress (Pham & Taylor 1999), at a user-chosen cadence — so effort counts even when outcomes slip.*
```

- [ ] **Step 2: Reframe rule #1 in `specs/00_README.md`**

Find rule #1 (begins "1. **The word "milestone" never appears") and replace that list item with:

```markdown
1. **A milestone is never a bare outcome deadline** — it is always paired with effort-based actions underneath it, and progress is recognised at the effort-action level. Use "milestone" for the proximal sub-goal layer and "action" for the controllable effort beneath it.
```

- [ ] **Step 3: Update the demo-readiness item in `specs/99_state_and_navigation.md`**

Find the line:

```markdown
- [ ] "Milestone" appears nowhere in the UI
```

and replace it with:

```markdown
- [ ] Goal flow is two pages: set the goal, then break it into milestones → effort actions
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all files pass (GoalSetup, App, AppContext, MilestoneCard, GoalActions, Cadence, OfferedSocial, Recognition, ReturnView, components).

- [ ] **Step 5: Production build check**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 6: Manual click-through**

Run `npm run dev`, open at 390px. Verify: app opens on Page 1 (goal + Locke & Latham note); Continue → Page 2 (goal name + back, "Break it into milestones" + Bandura note, milestone name editable headline, effort chips with Pham & Taylor note in the open card); Cadence shows the commitment note and the "Whenever I can" reassurance; Recognition shows the milestone label + the post-completion note; Return view groups by milestone with the progress note. The word "milestone" now appears intentionally.

- [ ] **Step 7: Commit the thesis reframe**

```bash
git add specs/00_README.md specs/99_state_and_navigation.md
git commit -m "docs: reframe A2 thesis around milestones nesting effort actions"
```

If Steps 4–6 surfaced code defects, fix them (re-running the relevant test first) and commit separately.

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §2 reframed thesis (00_README spine + rule #1; 99 checklist) | Task 6 |
| §5 Page 1 GoalSetup (brand/subhead/headline, light nudge, Locke & Latham note, Continue gating) | Task 1 |
| §6 Page 2 GoalActions (goal name + back, "Break it into milestones", Bandura note, milestones accordion, Next prune) | Task 2 |
| §7 rename steps→milestones, StepCard→MilestoneCard, currentScreen 'goal', Recognition/ReturnView consume milestones | Tasks 1–4 |
| §8 science notes (Page 1, Page 2 section, MilestoneCard, Cadence, Recognition, ReturnView; none on OfferedSocial) + `.scienceNote` global | Tasks 1–5 |
| §9 navigation (goal → goal-actions → cadence → …; re-offer → offered-social) | Tasks 1–2 (routing/back), unchanged elsewhere |
| §10 testing incl. removal of milestone guards | guards dropped in each rewritten test file (App T1, GoalActions/MilestoneCard T2, Recognition T3, ReturnView T4) |

**Type/interface consistency:** state field is `milestones` everywhere after Task 2; `allActions(milestones)` used in GoalActions, Recognition, ReturnView. `MilestoneCard` prop is `milestone` (not `step`); callbacks `onToggle/onRename/onAddAction/onRemoveAction` unchanged. Action shape `{ id, label, source, completed }` unchanged. New screen id `'goal'` registered in App SCREENS and set as `currentScreen` initial.

**Placeholder scan:** none — every code and test step has full content.

**Green-between-tasks:** Task 1 keeps everything green (GoalActions untouched, still reads `state.steps`). Task 2 renames the field + rebuilds Page 2; Recognition/ReturnView tests stay green because they seed their own state and their code is unchanged until Tasks 3–4 (live flow past Cadence is knowingly broken in that window). Task 6 verifies the whole flow.
