# Huddel App Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the finished onboarding into a small navigable app — a 3-tab shell (Goals · Huddle · Cheers) with the role-scoped Supporting concept, the My Huddle mirror, and a calm Encouragements inbox.

**Architecture:** Add a `Root` split in `App.jsx`: while `inApp` is false the existing onboarding `Router` renders; once Recognition calls `enterApp()`, an `AppShell` renders the active tab above a persistent `BottomNav`. Tabs read seeded demo data from `AppContext`. The visibility roles already in `src/data/roles.js` drive both the My Huddle ("what they see of you") and Supporting ("what you see of them") views.

**Tech Stack:** React 18 + Vite 5, CSS Modules (non-scoped class names in test via `vite.config.js`), Vitest + @testing-library/react, `AppContext` for state. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-27-huddel-app-slice-design.md`

---

## Conventions (read once before starting)

- **Test runner:** `npm test` runs the whole suite once (`vitest run`). Run a single file with `npx vitest run src/path/file.test.jsx`. Use `npx vitest run -t "name"` for one test.
- **Test helper:** `renderWithApp(ui, { initialStateOverrides })` from `src/test/helpers.jsx` wraps `ui` in `AppProvider`. Use it for component tests that read context.
- **Hook tests:** use `renderHook(() => useApp(), { wrapper })` with a local `wrapper` (see `src/context/AppContext.test.jsx`).
- **CSS Modules:** import `styles from './X.module.css'`; class names are emitted verbatim in tests, so `toHaveClass('active')` works. Global utility classes (`screenPad`, `bottomActions`, `scienceNote`) are plain strings in `src/styles/global.css`, written as `className="screenPad"`.
- **Fake timers:** navigation uses a 150ms fade; for any test that calls `goTo`, follow the `vi.useFakeTimers()` + `act(() => vi.advanceTimersByTime(150))` pattern. Tab switches (`setTab`) are instant — no timers needed.
- **Commit after each task** with the message shown in the task's final step.
- **Each task must end with the full suite green.** Baseline at start = 89 tests passing.

---

## File structure

**Modify:**
- `src/data/roles.js` — add `shareLabel` to each role (supporter-side pill text).
- `src/data/roles.test.js` — add a test for `shareLabel`.
- `src/context/AppContext.jsx` — seed `supporting` + `encouragements` in `defaultState`; add `inApp`/`activeTab` state, `DEMO_SUPPORTERS`, and `enterApp`/`setTab`/`sendEncouragement`; expose them.
- `src/context/AppContext.test.jsx` — tests for the new state/actions.
- `src/styles/global.css` — add `--nav-h`, `.appShell`, and lift `.bottomActions` above the nav inside the shell.
- `src/App.jsx` — split into `Root` (onboarding `Router` vs `AppShell`); remove the now-unused `return-view` route.
- `src/screens/Recognition.jsx` — continue + skip buttons call `enterApp()` instead of `goTo('return-view')`.

**Create (component + its `.module.css` + its `.test.jsx` unless noted):**
- `src/components/BottomNav.jsx`
- `src/components/AppShell.jsx`
- `src/components/SegmentedToggle.jsx`
- `src/screens/MyHuddleView.jsx`
- `src/components/SupportingCard.jsx`
- `src/screens/SupportingView.jsx`
- `src/components/EncouragementSheet.jsx`
- `src/screens/HuddleScreen.jsx`
- `src/screens/EncouragementsScreen.jsx`

The Goals tab reuses the existing `ReturnView` component unchanged.

---

### Task 1: Add `shareLabel` to roles

**Files:**
- Modify: `src/data/roles.js`
- Test: `src/data/roles.test.js`

- [ ] **Step 1: Write the failing test**

Add to `src/data/roles.test.js`:

```js
test('every role has a supporter-side shareLabel', () => {
  const expected = { all: 'shares everything', progress: 'shares progress', availability: 'availability only' }
  for (const role of ROLES) {
    expect(role.shareLabel).toBe(expected[role.value])
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/roles.test.js`
Expected: FAIL — `shareLabel` is undefined.

- [ ] **Step 3: Add the field**

Edit `src/data/roles.js` so each entry gains `shareLabel`:

```js
export const ROLES = [
  { value: 'all',          label: 'Everything',        description: 'Sees this goal, your progress, and the hard days — e.g. a partner or close friend.', sees: 'sees everything — your progress and the hard days', shareLabel: 'shares everything' },
  { value: 'progress',     label: 'Progress',          description: 'Sees your progress, not the struggles — e.g. an acquaintance.',                       sees: 'sees your progress', recommended: true, shareLabel: 'shares progress' },
  { value: 'availability', label: 'Just availability', description: "Sees that you're busy, not what you're working on — e.g. a manager or coworker.",     sees: "sees that you're busy", shareLabel: 'availability only' },
]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/data/roles.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/roles.js src/data/roles.test.js
git commit -m "feat: add supporter-side shareLabel to roles"
```

---

### Task 2: Extend AppContext — shell nav, seeded social data, actions

**Files:**
- Modify: `src/context/AppContext.jsx`
- Test: `src/context/AppContext.test.jsx`

- [ ] **Step 1: Write the failing tests**

Append to `src/context/AppContext.test.jsx`:

```js
test('default state seeds supporting and encouragements demo data', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state.supporting.map(p => p.role)).toEqual(['all', 'progress', 'availability'])
  expect(state.encouragements.received).toHaveLength(2)
  expect(state.encouragements.sent).toEqual([])
})

test('inApp starts false and activeTab starts at goals', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.inApp).toBe(false)
  expect(result.current.activeTab).toBe('goals')
})

test('enterApp enters the shell on the goals tab and seeds supporters when empty', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.enterApp() })
  expect(result.current.inApp).toBe(true)
  expect(result.current.activeTab).toBe('goals')
  expect(result.current.state.supporters.map(s => s.name)).toEqual(['Priya', 'Mum'])
})

test('enterApp keeps supporters the user already added', () => {
  function customWrapper({ children }) {
    return <AppProvider initialStateOverrides={{ supporters: [{ id: 'u1', name: 'Jo', role: 'all' }] }}>{children}</AppProvider>
  }
  const { result } = renderHook(() => useApp(), { wrapper: customWrapper })
  act(() => { result.current.enterApp() })
  expect(result.current.state.supporters).toEqual([{ id: 'u1', name: 'Jo', role: 'all' }])
})

test('setTab switches the active tab', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.setTab('huddle') })
  expect(result.current.activeTab).toBe('huddle')
})

test('sendEncouragement appends to the sent list', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.sendEncouragement({ toName: 'Sam', message: 'Keep going!' }) })
  expect(result.current.state.encouragements.sent).toHaveLength(1)
  expect(result.current.state.encouragements.sent[0]).toMatchObject({ to: 'Sam', message: 'Keep going!', when: 'just now' })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/context/AppContext.test.jsx`
Expected: FAIL — `state.supporting` undefined, `enterApp` is not a function, etc.

- [ ] **Step 3: Implement the context changes**

Edit `src/context/AppContext.jsx`. Replace the `defaultState` const and add `DEMO_SUPPORTERS` above it:

```jsx
const DEMO_SUPPORTERS = [
  { id: 'sup-1', name: 'Priya', role: 'all' },
  { id: 'sup-2', name: 'Mum',   role: 'progress' },
]

const defaultState = {
  goalName: '',
  milestones: [
    { id: 'milestone-1', name: '', actions: [] },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
  supporting: [
    { id: 'sg-1', name: 'Alex',   role: 'all',          goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true },
    { id: 'sg-2', name: 'Sam',    role: 'progress',      win: 'Just finished chapter 2' },
    { id: 'sg-3', name: 'Jordan', role: 'availability',  status: 'Busy this week' },
  ],
  encouragements: {
    received: [
      { id: 'enc-1', from: 'Priya', message: 'So proud of you for sticking with it 💜', when: '2h ago' },
      { id: 'enc-2', from: 'Mum',   message: 'Saw you did your writing today!',          when: 'yesterday' },
    ],
    sent: [],
  },
}
```

Inside `AppProvider`, add two state hooks next to the existing ones:

```jsx
  const [inApp, setInApp] = useState(false)
  const [activeTab, setActiveTab] = useState('goals')
```

Add three functions next to `updateState`:

```jsx
  function enterApp() {
    setState(prev => (prev.supporters.length ? prev : { ...prev, supporters: DEMO_SUPPORTERS }))
    setActiveTab('goals')
    setInApp(true)
  }

  function setTab(tab) {
    setActiveTab(tab)
  }

  function sendEncouragement({ toName, message }) {
    setState(prev => ({
      ...prev,
      encouragements: {
        ...prev.encouragements,
        sent: [
          ...prev.encouragements.sent,
          { id: `sent-${prev.encouragements.sent.length + 1}`, to: toName, message, when: 'just now' },
        ],
      },
    }))
  }
```

Extend the provider value object to include the new fields:

```jsx
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, goBack, canGoBack, updateState, inApp, activeTab, enterApp, setTab, sendEncouragement }}>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/context/AppContext.test.jsx`
Expected: PASS (16 tests). The existing `supporters` toEqual([]) test still passes because the default is unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: add app-shell nav state, seeded social data, sendEncouragement"
```

---

### Task 3: BottomNav component

**Files:**
- Create: `src/components/BottomNav.jsx`, `src/components/BottomNav.module.css`
- Test: `src/components/BottomNav.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/BottomNav.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import BottomNav from './BottomNav'

test('renders the three tabs', () => {
  renderWithApp(<BottomNav />)
  expect(screen.getByRole('button', { name: /goals/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /huddle/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cheers/i })).toBeInTheDocument()
})

test('marks the active tab with the active class', () => {
  renderWithApp(<BottomNav />)
  expect(screen.getByRole('button', { name: /goals/i })).toHaveClass('active')
  expect(screen.getByRole('button', { name: /huddle/i })).not.toHaveClass('active')
})

test('tapping a tab switches the active tab', async () => {
  renderWithApp(<BottomNav />)
  await userEvent.click(screen.getByRole('button', { name: /huddle/i }))
  expect(screen.getByRole('button', { name: /huddle/i })).toHaveClass('active')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/BottomNav.test.jsx`
Expected: FAIL — cannot resolve `./BottomNav`.

- [ ] **Step 3: Implement BottomNav**

Create `src/components/BottomNav.jsx`:

```jsx
import { useApp } from '../context/AppContext'
import styles from './BottomNav.module.css'

const TABS = [
  { value: 'goals',          label: 'Goals',  icon: '◆' },
  { value: 'huddle',         label: 'Huddle', icon: '○' },
  { value: 'encouragements', label: 'Cheers', icon: '♡' },
]

export default function BottomNav() {
  const { activeTab, setTab } = useApp()
  return (
    <nav className={styles.nav}>
      {TABS.map(tab => (
        <button
          key={tab.value}
          type="button"
          className={`${styles.tab} ${activeTab === tab.value ? 'active' : ''}`}
          onClick={() => setTab(tab.value)}
        >
          <span className={styles.icon} aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
```

Create `src/components/BottomNav.module.css`:

```css
.nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  height: var(--nav-h);
  display: flex;
  background: var(--color-white);
  border-top: 1px solid #ececec;
  z-index: 10;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-body-gray);
  cursor: pointer;
  border-top: 2px solid transparent;
}

.tab.active {
  color: var(--color-purple);
  border-top-color: var(--color-purple);
}

.icon {
  font-size: 16px;
  line-height: 1;
}
```

> Note: `var(--nav-h)` is defined in Task 4. Until then the height resolves to `0`; that's fine — Task 4 runs before any manual viewing.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/BottomNav.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomNav.jsx src/components/BottomNav.module.css src/components/BottomNav.test.jsx
git commit -m "feat: add BottomNav tab bar"
```

---

### Task 4: AppShell + Root split + Recognition handoff

**Files:**
- Create: `src/components/AppShell.jsx`, `src/components/AppShell.module.css`
- Test: `src/components/AppShell.test.jsx`
- Modify: `src/styles/global.css`, `src/App.jsx`, `src/screens/Recognition.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/AppShell.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import AppShell from './AppShell'

const state = { goalName: 'Finish my essay', supporters: [{ id: 's1', name: 'Priya', role: 'all' }] }

test('renders the Goals tab (home base) by default with the bottom nav', () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  expect(screen.getByText('Welcome back.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /goals/i })).toBeInTheDocument()
})

test('switching to the Huddle tab shows the huddle content', async () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('button', { name: /huddle/i }))
  // text-based so it holds against both the Task-4 stub and the Task-10 component
  expect(screen.getByText('Supporting')).toBeInTheDocument()
})

test('switching to the Cheers tab shows the encouragements inbox', async () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('button', { name: /cheers/i }))
  expect(screen.getByText('Encouragements')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/AppShell.test.jsx`
Expected: FAIL — cannot resolve `./AppShell` (and its tab imports, added in later tasks, do not exist yet).

> The Huddle and Cheers assertions depend on `HuddleScreen` (Task 10) and `EncouragementsScreen` (Task 11). To keep this task self-contained, **create temporary stub files now** and replace them in their own tasks. This keeps each task's suite green.

- [ ] **Step 3: Add nav tokens + shell CSS to global.css**

Append to `:root` in `src/styles/global.css`:

```css
  --nav-h: 64px;
```

Append at the end of `src/styles/global.css`:

```css
/* ── App shell: leaves room for the fixed bottom nav, and lifts any screen's
   bottom action bar above the nav so they don't overlap ── */
.appShell {
  min-height: 100dvh;
  padding-bottom: var(--nav-h);
}

.appShell .bottomActions {
  bottom: var(--nav-h);
}
```

- [ ] **Step 4: Create temporary stubs for the two not-yet-built tabs**

Create `src/screens/HuddleScreen.jsx` (replaced in Task 10):

```jsx
export default function HuddleScreen() {
  return (
    <div className="screenPad">
      <button type="button">Supporting</button>
    </div>
  )
}
```

Create `src/screens/EncouragementsScreen.jsx` (replaced in Task 11):

```jsx
export default function EncouragementsScreen() {
  return <div className="screenPad"><h1>Encouragements</h1></div>
}
```

- [ ] **Step 5: Implement AppShell**

Create `src/components/AppShell.jsx`:

```jsx
import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import ReturnView from '../screens/ReturnView'
import HuddleScreen from '../screens/HuddleScreen'
import EncouragementsScreen from '../screens/EncouragementsScreen'
import styles from './AppShell.module.css'

const TABS = {
  goals:          ReturnView,
  huddle:         HuddleScreen,
  encouragements: EncouragementsScreen,
}

export default function AppShell() {
  const { activeTab } = useApp()
  const Tab = TABS[activeTab] || ReturnView
  return (
    <div className={`appShell ${styles.shell}`}>
      <Tab />
      <BottomNav />
    </div>
  )
}
```

Create `src/components/AppShell.module.css`:

```css
.shell {
  position: relative;
}
```

- [ ] **Step 6: Wire the Root split in App.jsx**

Replace the contents of `src/App.jsx` with:

```jsx
import { AppProvider, useApp } from './context/AppContext'
import GoalSetup from './screens/GoalSetup'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import AppShell from './components/AppShell'
import styles from './App.module.css'

const SCREENS = {
  'goal':           GoalSetup,
  'goal-actions':   GoalActions,
  'cadence':        Cadence,
  'offered-social': OfferedSocial,
  'recognition':    Recognition,
}

function OnboardingRouter() {
  const { currentScreen, fading } = useApp()
  const Screen = SCREENS[currentScreen]
  return (
    <div className={`screenWrapper ${fading ? 'fading' : ''}`}>
      <Screen />
    </div>
  )
}

function Root() {
  const { inApp } = useApp()
  return inApp ? <AppShell /> : <OnboardingRouter />
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
```

> `ReturnView` is no longer imported by `App.jsx` (it now lives behind `AppShell`), and the `return-view` route is gone. `styles` import is retained only if `App.module.css` is used elsewhere; if your editor flags it as unused, delete the import line.

- [ ] **Step 7: Rewire Recognition's continue + skip to enter the app**

In `src/screens/Recognition.jsx`, change the destructure on line ~10 from:

```jsx
  const { state, updateState, goTo, goBack } = useApp()
```
to:
```jsx
  const { state, updateState, enterApp, goBack } = useApp()
```

Then change both bottom buttons from `onClick={() => goTo('return-view')}` to `onClick={enterApp}`:

```jsx
      <div className="bottomActions">
        {showContinue && (
          <PrimaryButton onClick={enterApp}>
            {continueLabel}
          </PrimaryButton>
        )}
        <SkipButton onClick={enterApp}>Skip for now</SkipButton>
      </div>
```

> `goTo` is no longer used in this file. Leaving it out of the destructure is correct. The Recognition tests assert button *text* only, so they stay green.

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS — all prior tests plus the 3 new AppShell tests. (AppShell's Huddle/Cheers assertions pass against the stubs: the stub renders a "Supporting" button and an "Encouragements" heading.)

- [ ] **Step 9: Commit**

```bash
git add src/components/AppShell.jsx src/components/AppShell.module.css src/components/AppShell.test.jsx src/styles/global.css src/App.jsx src/screens/Recognition.jsx src/screens/HuddleScreen.jsx src/screens/EncouragementsScreen.jsx
git commit -m "feat: app shell with tab routing; onboarding hands off to shell"
```

---

### Task 5: SegmentedToggle component

**Files:**
- Create: `src/components/SegmentedToggle.jsx`, `src/components/SegmentedToggle.module.css`
- Test: `src/components/SegmentedToggle.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/SegmentedToggle.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SegmentedToggle from './SegmentedToggle'

const options = [{ value: 'a', label: 'First' }, { value: 'b', label: 'Second' }]

test('renders both segment labels', () => {
  render(<SegmentedToggle options={options} value="a" onChange={() => {}} />)
  expect(screen.getByRole('tab', { name: 'First' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument()
})

test('marks the selected segment active', () => {
  render(<SegmentedToggle options={options} value="b" onChange={() => {}} />)
  expect(screen.getByRole('tab', { name: 'Second' })).toHaveClass('active')
  expect(screen.getByRole('tab', { name: 'First' })).not.toHaveClass('active')
})

test('calls onChange with the clicked value', async () => {
  const onChange = vi.fn()
  render(<SegmentedToggle options={options} value="a" onChange={onChange} />)
  await userEvent.click(screen.getByRole('tab', { name: 'Second' }))
  expect(onChange).toHaveBeenCalledWith('b')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SegmentedToggle.test.jsx`
Expected: FAIL — cannot resolve `./SegmentedToggle`.

- [ ] **Step 3: Implement SegmentedToggle**

Create `src/components/SegmentedToggle.jsx`:

```jsx
import styles from './SegmentedToggle.module.css'

export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className={styles.toggle} role="tablist">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`${styles.segment} ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

Create `src/components/SegmentedToggle.module.css`:

```css
.toggle {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid #ececec;
}

.segment {
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-body-gray);
  padding: 0 0 var(--space-3);
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.segment.active {
  color: var(--color-purple);
  font-weight: 600;
  border-bottom-color: var(--color-purple);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SegmentedToggle.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SegmentedToggle.jsx src/components/SegmentedToggle.module.css src/components/SegmentedToggle.test.jsx
git commit -m "feat: add reusable SegmentedToggle"
```

---

### Task 6: MyHuddleView (people supporting you, with inline add)

**Files:**
- Create: `src/screens/MyHuddleView.jsx`, `src/screens/MyHuddleView.module.css`
- Test: `src/screens/MyHuddleView.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/MyHuddleView.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import MyHuddleView from './MyHuddleView'

const withSupporters = { supporters: [
  { id: 's1', name: 'Priya', role: 'all' },
  { id: 's2', name: 'Mum',   role: 'progress' },
] }

test('lists supporters with what each one sees', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: withSupporters })
  expect(screen.getByText('Priya')).toBeInTheDocument()
  expect(screen.getByText('Mum')).toBeInTheDocument()
  expect(screen.getByText(/sees your progress/i)).toBeInTheDocument()
})

test('shows the calm subhead', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: withSupporters })
  expect(screen.getByText('You choose what each one sees.')).toBeInTheDocument()
})

test('empty state is gentle', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: { supporters: [] } })
  expect(screen.getByText(/No one yet — and that's completely fine\./i)).toBeInTheDocument()
})

test('inline add appends a supporter', async () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: { supporters: [] } })
  await userEvent.click(screen.getByRole('button', { name: /\+ Add someone/i }))
  await userEvent.type(screen.getByPlaceholderText('Name or contact'), 'Sky')
  await userEvent.click(screen.getByRole('button', { name: 'Progress' }))
  await userEvent.click(screen.getByRole('button', { name: /^Add$/ }))
  expect(screen.getByText('Sky')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/MyHuddleView.test.jsx`
Expected: FAIL — cannot resolve `./MyHuddleView`.

- [ ] **Step 3: Implement MyHuddleView**

Create `src/screens/MyHuddleView.jsx`:

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import styles from './MyHuddleView.module.css'

export default function MyHuddleView() {
  const { state, updateState } = useApp()
  const supporters = state.supporters
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('progress')

  function handleAdd() {
    if (!name.trim()) return
    const next = [...supporters, { id: `sup-${Date.now()}`, name: name.trim(), role }]
    updateState({ supporters: next })
    setName('')
    setRole('progress')
    setAdding(false)
  }

  return (
    <div>
      <p className={styles.subhead}>You choose what each one sees.</p>
      {supporters.length === 0 && !adding && (
        <p className={styles.empty}>No one yet — and that&apos;s completely fine.</p>
      )}
      <p className="scienceNote">You choose what each person sees — broadcasting an identity-goal too widely can sap the drive to pursue it. — Gollwitzer et al., 2009</p>

      <ul className={styles.list}>
        {supporters.map(s => {
          const role = ROLES.find(r => r.value === s.role)
          return (
            <li key={s.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.pill}>{role?.label}</span>
              </div>
              <p className={styles.sees}>{role?.sees}</p>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <div className={styles.addForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Name or contact"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className={styles.roleChips}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`${styles.chip} ${role === r.value ? 'active' : ''}`}
                onClick={() => setRole(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={handleAdd} disabled={!name.trim()}>Add</button>
        </div>
      ) : (
        <button type="button" className={styles.addLink} onClick={() => setAdding(true)}>+ Add someone</button>
      )}
    </div>
  )
}
```

Create `src/screens/MyHuddleView.module.css`:

```css
.subhead { font-size: 14px; color: var(--color-body-gray); margin-bottom: var(--space-3); }
.empty   { font-size: 15px; color: var(--color-body-gray); margin: var(--space-5) 0; }

.list { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5); }

.card { background: var(--color-beige); border-radius: var(--radius-card); padding: var(--space-5); }
.cardTop { display: flex; justify-content: space-between; align-items: center; }
.name { font-weight: 600; color: var(--color-black); }
.pill { font-size: 11px; background: var(--color-purple-tint); color: var(--color-purple); padding: 3px 9px; border-radius: 10px; }
.sees { font-size: 13px; color: var(--color-body-gray); margin-top: var(--space-2); }

.addLink { display: block; width: 100%; text-align: center; background: none; border: none; color: var(--color-purple); font-family: var(--font-body); font-size: 14px; font-weight: 600; cursor: pointer; padding: var(--space-3); }

.addForm { background: var(--color-soft-blue); border-radius: var(--radius-card); padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.input { padding: 10px 14px; border: 1px solid #ddd; border-radius: 12px; font-family: var(--font-body); font-size: 14px; }
.roleChips { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.chip { font-size: 12px; padding: 6px 12px; border-radius: 14px; border: 1px solid #ddd; background: var(--color-white); color: var(--color-body-gray); cursor: pointer; }
.chip.active { border-color: var(--color-purple); background: var(--color-purple-tint); color: var(--color-purple); }
.addBtn { padding: 10px; border: none; border-radius: var(--radius-button); background: var(--color-purple); color: var(--color-white); font-family: var(--font-body); font-weight: 600; cursor: pointer; }
.addBtn:disabled { opacity: 0.45; cursor: default; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/screens/MyHuddleView.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/screens/MyHuddleView.jsx src/screens/MyHuddleView.module.css src/screens/MyHuddleView.test.jsx
git commit -m "feat: add My Huddle view with inline add"
```

---

### Task 7: SupportingCard (role-scoped — the centerpiece)

**Files:**
- Create: `src/components/SupportingCard.jsx`, `src/components/SupportingCard.module.css`
- Test: `src/components/SupportingCard.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/SupportingCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SupportingCard from './SupportingCard'

const everything = { id: 'sg-1', name: 'Alex', role: 'all', goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true }
const progress   = { id: 'sg-2', name: 'Sam',  role: 'progress', win: 'Just finished chapter 2' }
const availability = { id: 'sg-3', name: 'Jordan', role: 'availability', status: 'Busy this week' }

test('Everything role shows goal, progress, struggle and both actions', () => {
  render(<SupportingCard person={everything} onAct={() => {}} />)
  expect(screen.getByText('Run a half-marathon')).toBeInTheDocument()
  expect(screen.getByText(/3 of 5 runs this week/)).toBeInTheDocument()
  expect(screen.getByText(/rough week/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send encouragement/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
})

test('Progress role shows the win and only a cheer action', () => {
  render(<SupportingCard person={progress} onAct={() => {}} />)
  expect(screen.getByText(/Just finished chapter 2/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cheer this win/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
})

test('Availability role shows the space line and NO action button', () => {
  render(<SupportingCard person={availability} onAct={() => {}} />)
  expect(screen.getByText(/give them space/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('an action calls onAct with the person and chosen mode', async () => {
  const onAct = vi.fn()
  render(<SupportingCard person={progress} onAct={onAct} />)
  await userEvent.click(screen.getByRole('button', { name: /cheer this win/i }))
  expect(onAct).toHaveBeenCalledWith(progress, 'cheer')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SupportingCard.test.jsx`
Expected: FAIL — cannot resolve `./SupportingCard`.

- [ ] **Step 3: Implement SupportingCard**

Create `src/components/SupportingCard.jsx`:

```jsx
import { ROLES } from '../data/roles'
import styles from './SupportingCard.module.css'

export default function SupportingCard({ person, onAct }) {
  const shareLabel = ROLES.find(r => r.value === person.role)?.shareLabel

  if (person.role === 'availability') {
    return (
      <div className={`${styles.card} ${styles.quiet}`}>
        <div className={styles.top}>
          <span className={styles.nameMuted}>{person.name}</span>
          <span className={styles.pillMuted}>{shareLabel}</span>
        </div>
        <p className={styles.spaceLine}>{person.status} — give them space.</p>
        <p className={styles.footnote}>No goal shared. Nothing to do here, and that&apos;s the point.</p>
      </div>
    )
  }

  if (person.role === 'progress') {
    return (
      <div className={styles.card}>
        <div className={styles.top}>
          <span className={styles.name}>{person.name}</span>
          <span className={styles.pillGreen}>{shareLabel}</span>
        </div>
        <p className={styles.win}>● {person.win}</p>
        <button type="button" className={styles.primaryAction} onClick={() => onAct(person, 'cheer')}>
          Cheer this win
        </button>
        <p className={styles.footnote}>You see wins, not the hard days.</p>
      </div>
    )
  }

  // role === 'all'
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.name}>{person.name}</span>
        <span className={styles.pill}>{shareLabel}</span>
      </div>
      <p className={styles.goal}>{person.goal}</p>
      <p className={styles.progress}>● {person.progress}</p>
      {person.struggleFlag && <p className={styles.struggle}>○ Flagged a rough week</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryAction} onClick={() => onAct(person, 'cheer')}>
          Send encouragement
        </button>
        <button type="button" className={styles.secondaryAction} onClick={() => onAct(person, 'checkin')}>
          Check in
        </button>
      </div>
    </div>
  )
}
```

Create `src/components/SupportingCard.module.css`:

```css
.card { background: var(--color-beige); border-radius: var(--radius-card); padding: var(--space-5); }
.quiet { background: var(--color-soft-blue); border: 1px dashed #e0e0e0; }

.top { display: flex; justify-content: space-between; align-items: center; }
.name { font-weight: 600; color: var(--color-black); }
.nameMuted { font-weight: 600; color: var(--color-body-gray); }

.pill { font-size: 11px; background: var(--color-purple-tint); color: var(--color-purple); padding: 3px 9px; border-radius: 10px; }
.pillGreen { font-size: 11px; background: #e7f7ee; color: #2c9e63; padding: 3px 9px; border-radius: 10px; }
.pillMuted { font-size: 11px; background: #eee; color: var(--color-body-gray); padding: 3px 9px; border-radius: 10px; }

.goal { font-size: 14px; color: var(--color-black); margin: var(--space-3) 0 var(--space-2); }
.progress { font-size: 13px; color: #2c9e63; }
.struggle { font-size: 13px; color: #a05a2c; margin-top: 2px; }
.win { font-size: 13px; color: #2c9e63; margin: var(--space-3) 0; }
.spaceLine { font-size: 13px; color: var(--color-body-gray); margin: var(--space-3) 0 var(--space-2); }
.footnote { font-size: 11px; color: #999; margin-top: var(--space-3); }

.actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
.primaryAction { background: var(--color-purple); color: var(--color-white); border: none; border-radius: 14px; font-family: var(--font-body); font-size: 12px; font-weight: 600; padding: 7px 14px; cursor: pointer; }
.secondaryAction { background: var(--color-white); color: var(--color-body-gray); border: 1px solid #ddd; border-radius: 14px; font-family: var(--font-body); font-size: 12px; padding: 7px 14px; cursor: pointer; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SupportingCard.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SupportingCard.jsx src/components/SupportingCard.module.css src/components/SupportingCard.test.jsx
git commit -m "feat: add role-scoped SupportingCard"
```

---

### Task 8: EncouragementSheet (compose overlay)

**Files:**
- Create: `src/components/EncouragementSheet.jsx`, `src/components/EncouragementSheet.module.css`
- Test: `src/components/EncouragementSheet.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/EncouragementSheet.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EncouragementSheet from './EncouragementSheet'

const baseProps = {
  person: { name: 'Sam' },
  contextLine: 'Cheer Sam — Just finished chapter 2',
  presets: ['Proud of you 💜', 'Keep going!', "You've got this"],
}

test('shows the context line and presets', () => {
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={() => {}} />)
  expect(screen.getByText('Cheer Sam — Just finished chapter 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Keep going!' })).toBeInTheDocument()
})

test('send is disabled until a preset is chosen or text entered', async () => {
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={() => {}} />)
  expect(screen.getByRole('button', { name: /send to sam/i })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Keep going!' }))
  expect(screen.getByRole('button', { name: /send to sam/i })).toBeEnabled()
})

test('sending calls onSend with the chosen message', async () => {
  const onSend = vi.fn()
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={onSend} />)
  await userEvent.click(screen.getByRole('button', { name: 'Proud of you 💜' }))
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(onSend).toHaveBeenCalledWith('Proud of you 💜')
})

test('free text overrides the preset as the sent message', async () => {
  const onSend = vi.fn()
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={onSend} />)
  await userEvent.type(screen.getByPlaceholderText(/add your own words/i), 'You inspire me')
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(onSend).toHaveBeenCalledWith('You inspire me')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/EncouragementSheet.test.jsx`
Expected: FAIL — cannot resolve `./EncouragementSheet`.

- [ ] **Step 3: Implement EncouragementSheet**

Create `src/components/EncouragementSheet.jsx`:

```jsx
import { useState } from 'react'
import PrimaryButton from './PrimaryButton'
import styles from './EncouragementSheet.module.css'

export default function EncouragementSheet({ person, contextLine, presets, onClose, onSend }) {
  const [preset, setPreset] = useState(null)
  const [text, setText] = useState('')

  const message = text.trim() || preset
  const canSend = Boolean(message)

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <p className={styles.context}>{contextLine}</p>
        <div className={styles.presets}>
          {presets.map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.preset} ${preset === p ? 'active' : ''}`}
              onClick={() => setPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          className={styles.input}
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
```

Create `src/components/EncouragementSheet.module.css`:

```css
.backdrop {
  position: fixed;
  inset: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 390px;
  background: rgba(6, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  background: var(--color-white);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  border-top: 3px solid var(--color-purple);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.context { font-size: 14px; color: var(--color-black); }
.presets { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.preset { font-size: 12px; padding: 7px 13px; border-radius: 14px; border: 1px solid #ddd; background: var(--color-beige); color: var(--color-body-gray); cursor: pointer; }
.preset.active { background: var(--color-purple-tint); color: var(--color-purple); border-color: var(--color-purple); }
.input { padding: 10px 14px; border: 1px solid #eee; border-radius: 12px; font-family: var(--font-body); font-size: 13px; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/EncouragementSheet.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/EncouragementSheet.jsx src/components/EncouragementSheet.module.css src/components/EncouragementSheet.test.jsx
git commit -m "feat: add EncouragementSheet compose overlay"
```

---

### Task 9: SupportingView (cards + sheet + confirmation)

**Files:**
- Create: `src/screens/SupportingView.jsx`, `src/screens/SupportingView.module.css`
- Test: `src/screens/SupportingView.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/SupportingView.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import SupportingView from './SupportingView'

test('renders all three seeded people by role', () => {
  renderWithApp(<SupportingView />)
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText('Sam')).toBeInTheDocument()
  expect(screen.getByText('Jordan')).toBeInTheDocument()
  expect(screen.getByText(/You see what each person chose to share/i)).toBeInTheDocument()
})

test('cheering opens the sheet, and sending shows a confirmation', async () => {
  renderWithApp(<SupportingView />)
  await userEvent.click(screen.getByRole('button', { name: /cheer this win/i }))
  expect(screen.getByText(/Cheer Sam/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Keep going!' }))
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(screen.getByText('Sent to Sam.')).toBeInTheDocument()
})

test('check-in on an Everything supporter offers the Thinking of you preset', async () => {
  renderWithApp(<SupportingView />)
  await userEvent.click(screen.getByRole('button', { name: /check in/i }))
  expect(screen.getByText(/Check in with Alex/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Thinking of you' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/SupportingView.test.jsx`
Expected: FAIL — cannot resolve `./SupportingView`.

- [ ] **Step 3: Implement SupportingView**

Create `src/screens/SupportingView.jsx`:

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import SupportingCard from '../components/SupportingCard'
import EncouragementSheet from '../components/EncouragementSheet'
import styles from './SupportingView.module.css'

const CHEER_PRESETS = ['Proud of you 💜', 'Keep going!', "You've got this"]
const CHECKIN_PRESETS = ['Thinking of you', 'Proud of you 💜', "You've got this"]

export default function SupportingView() {
  const { state, sendEncouragement } = useApp()
  const people = state.supporting
  const [sheet, setSheet] = useState(null) // { person, mode }
  const [confirmation, setConfirmation] = useState(null)

  function openSheet(person, mode) {
    setConfirmation(null)
    setSheet({ person, mode })
  }

  function handleSend(message) {
    sendEncouragement({ toName: sheet.person.name, message })
    setConfirmation(sheet.person.name)
    setSheet(null)
  }

  function contextLine(person, mode) {
    if (mode === 'checkin') return `Check in with ${person.name}`
    const detail = person.win || person.goal
    return `Cheer ${person.name} — ${detail}`
  }

  return (
    <div>
      <p className={styles.subhead}>You see what each person chose to share. Nothing more.</p>
      <p className={styles.count}>{people.length} people in your corner</p>
      <p className="scienceNote">You see only what each person chose — visible support can burden more than it helps. — Bolger, Zuckerman &amp; Kessler, 2000</p>

      {confirmation && <p className={styles.confirmation}>Sent to {confirmation}.</p>}

      <div className={styles.list}>
        {people.map(person => (
          <SupportingCard key={person.id} person={person} onAct={openSheet} />
        ))}
      </div>

      {sheet && (
        <EncouragementSheet
          person={sheet.person}
          contextLine={contextLine(sheet.person, sheet.mode)}
          presets={sheet.mode === 'checkin' ? CHECKIN_PRESETS : CHEER_PRESETS}
          onClose={() => setSheet(null)}
          onSend={handleSend}
        />
      )}
    </div>
  )
}
```

Create `src/screens/SupportingView.module.css`:

```css
.subhead { font-size: 14px; color: var(--color-body-gray); margin-bottom: var(--space-2); }
.count { font-family: var(--font-heading); font-size: 17px; color: var(--color-black); margin-bottom: var(--space-2); }
.confirmation { font-size: 13px; font-weight: 600; color: var(--color-purple); margin-bottom: var(--space-3); }
.list { display: flex; flex-direction: column; gap: var(--space-3); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/screens/SupportingView.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/screens/SupportingView.jsx src/screens/SupportingView.module.css src/screens/SupportingView.test.jsx
git commit -m "feat: add Supporting view with cheer/check-in sheet"
```

---

### Task 10: HuddleScreen (replace stub with the real toggle host)

**Files:**
- Modify: `src/screens/HuddleScreen.jsx` (replace the Task 4 stub)
- Create: `src/screens/HuddleScreen.module.css`
- Test: `src/screens/HuddleScreen.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/HuddleScreen.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import HuddleScreen from './HuddleScreen'

const state = { supporters: [{ id: 's1', name: 'Priya', role: 'all' }] }

test('defaults to My huddle and shows supporters', () => {
  renderWithApp(<HuddleScreen />, { initialStateOverrides: state })
  expect(screen.getByRole('tab', { name: /my huddle/i })).toHaveClass('active')
  expect(screen.getByText('Priya')).toBeInTheDocument()
})

test('switching to Supporting shows the people you support', async () => {
  renderWithApp(<HuddleScreen />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('tab', { name: /supporting/i }))
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText(/You see what each person chose to share/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/HuddleScreen.test.jsx`
Expected: FAIL — the stub renders neither tabs nor "Priya".

- [ ] **Step 3: Replace the stub**

Overwrite `src/screens/HuddleScreen.jsx`:

```jsx
import { useState } from 'react'
import SegmentedToggle from '../components/SegmentedToggle'
import MyHuddleView from './MyHuddleView'
import SupportingView from './SupportingView'

const OPTIONS = [
  { value: 'mine',       label: 'My huddle' },
  { value: 'supporting', label: 'Supporting' },
]

export default function HuddleScreen() {
  const [view, setView] = useState('mine')
  return (
    <div className="screenPad">
      <SegmentedToggle options={OPTIONS} value={view} onChange={setView} />
      {view === 'mine' ? <MyHuddleView /> : <SupportingView />}
    </div>
  )
}
```

Create `src/screens/HuddleScreen.module.css` (empty placeholder so future styling has a home; optional, skip if you prefer):

```css
/* layout handled by SegmentedToggle + the two views */
```

> The stub had no separate test or CSS, so nothing else needs cleanup.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/HuddleScreen.test.jsx src/components/AppShell.test.jsx`
Expected: PASS — HuddleScreen (2 tests) and AppShell's Huddle assertion still find the "Supporting" tab.

- [ ] **Step 5: Commit**

```bash
git add src/screens/HuddleScreen.jsx src/screens/HuddleScreen.module.css src/screens/HuddleScreen.test.jsx
git commit -m "feat: HuddleScreen hosts My huddle / Supporting toggle"
```

---

### Task 11: EncouragementsScreen (replace stub with Received / Sent)

**Files:**
- Modify: `src/screens/EncouragementsScreen.jsx` (replace the Task 4 stub)
- Create: `src/screens/EncouragementsScreen.module.css`
- Test: `src/screens/EncouragementsScreen.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/EncouragementsScreen.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import EncouragementsScreen from './EncouragementsScreen'

test('Received shows seeded messages and the calm footnote', () => {
  renderWithApp(<EncouragementsScreen />)
  expect(screen.getByText(/So proud of you for sticking with it/)).toBeInTheDocument()
  expect(screen.getByText(/Priya · 2h ago/)).toBeInTheDocument()
  expect(screen.getByText('No counts. No streaks. Just the words.')).toBeInTheDocument()
})

test('Sent is empty by default with a gentle prompt', async () => {
  renderWithApp(<EncouragementsScreen />)
  await userEvent.click(screen.getByRole('tab', { name: /sent/i }))
  expect(screen.getByText('Nothing sent yet. Cheer someone from Supporting.')).toBeInTheDocument()
})

test('Sent lists messages the user has sent', async () => {
  renderWithApp(<EncouragementsScreen />, { initialStateOverrides: {
    encouragements: { received: [], sent: [{ id: 'st1', to: 'Sam', message: 'Keep going!', when: 'just now' }] },
  } })
  await userEvent.click(screen.getByRole('tab', { name: /sent/i }))
  expect(screen.getByText(/Keep going!/)).toBeInTheDocument()
  expect(screen.getByText(/To Sam · just now/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/EncouragementsScreen.test.jsx`
Expected: FAIL — the stub renders only an `<h1>` and no messages/tabs.

- [ ] **Step 3: Replace the stub**

Overwrite `src/screens/EncouragementsScreen.jsx`:

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import SegmentedToggle from '../components/SegmentedToggle'
import styles from './EncouragementsScreen.module.css'

const OPTIONS = [
  { value: 'received', label: 'Received' },
  { value: 'sent',     label: 'Sent' },
]

export default function EncouragementsScreen() {
  const { state } = useApp()
  const { received, sent } = state.encouragements
  const [view, setView] = useState('received')

  return (
    <div className="screenPad">
      <h1 className={styles.title}>Encouragements</h1>
      <SegmentedToggle options={OPTIONS} value={view} onChange={setView} />

      {view === 'received' ? (
        <>
          <ul className={styles.list}>
            {received.map(e => (
              <li key={e.id} className={styles.card}>
                <p className={styles.message}>&ldquo;{e.message}&rdquo;</p>
                <p className={styles.meta}>{e.from} · {e.when}</p>
              </li>
            ))}
          </ul>
          <p className={styles.footnote}>No counts. No streaks. Just the words.</p>
        </>
      ) : (
        sent.length === 0 ? (
          <p className={styles.empty}>Nothing sent yet. Cheer someone from Supporting.</p>
        ) : (
          <ul className={styles.list}>
            {sent.map(e => (
              <li key={e.id} className={styles.card}>
                <p className={styles.message}>&ldquo;{e.message}&rdquo;</p>
                <p className={styles.meta}>To {e.to} · {e.when}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
```

Create `src/screens/EncouragementsScreen.module.css`:

```css
.title { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--color-black); margin-bottom: var(--space-5); }
.list { list-style: none; display: flex; flex-direction: column; gap: var(--space-3); }
.card { background: var(--color-beige); border-radius: var(--radius-card); padding: var(--space-5); }
.message { font-size: 14px; color: var(--color-black); }
.meta { font-size: 11px; color: #999; margin-top: var(--space-3); }
.footnote { font-size: 11px; color: #aaa; text-align: center; margin-top: var(--space-5); }
.empty { font-size: 14px; color: var(--color-body-gray); margin-top: var(--space-5); }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/EncouragementsScreen.test.jsx src/components/AppShell.test.jsx`
Expected: PASS — EncouragementsScreen (3 tests) and AppShell's Cheers assertion still finds "Encouragements".

- [ ] **Step 5: Commit**

```bash
git add src/screens/EncouragementsScreen.jsx src/screens/EncouragementsScreen.module.css src/screens/EncouragementsScreen.test.jsx
git commit -m "feat: Encouragements inbox with Received / Sent"
```

---

### Task 12: Full-suite verification + manual demo walkthrough

**Files:** none (verification only)

- [ ] **Step 1: Run the entire suite**

Run: `npm test`
Expected: PASS — all files green. Baseline 89 + new tests (≈ 30 added). No failures, no unhandled-act warnings that fail the run.

- [ ] **Step 2: Start the dev server and walk the demo**

Run: `npm run dev` and open `http://localhost:5173` at 390px width. Verify each item:

- Complete onboarding (set a goal → actions → cadence → supporters → Recognition). Tap **the continue button** → lands in the app shell on the **Goals** tab (you should see "Welcome back." and your goal).
- Bottom tab bar shows **Goals · Huddle · Cheers** and persists across all three; the active tab is purple with a top border; it sits at the bottom and does not overlap content.
- **Goals** tab: the seeded supporters ("Your corner": Priya, Mum) appear; completing actions still works.
- **Huddle** tab: defaults to **My huddle** (Priya, Mum with what each sees). Tap **+ Add someone** → inline form → add a person → it appears. Switch to **Supporting**: Alex (full: goal, progress, rough-week, two actions), Sam (win + Cheer only), Jordan (quiet, dashed, **no button**).
- Tap **Cheer this win** on Sam → sheet opens → pick a preset → **Send to Sam** → sheet closes, "Sent to Sam." confirmation shows.
- **Cheers** tab → **Sent**: the message to Sam is listed. **Received**: Priya/Mum messages + "No counts. No streaks. Just the words."
- Confirm no streaks/points/badges/confetti anywhere; ≤3 accent colours per screen; no yellow text.

> If the Goals tab's "Mark today's action done" button overlaps the nav, re-check the `.appShell .bottomActions { bottom: var(--nav-h); }` rule from Task 4.

- [ ] **Step 3: Commit any final tweaks**

If Step 2 surfaced CSS tweaks, commit them:

```bash
git add -A
git commit -m "fix: app-slice demo polish from manual walkthrough"
```

If nothing changed, skip this step.

---

## Self-review (completed by plan author)

**Spec coverage:** Nav shell → Tasks 3–4. Goals tab (ReturnView reuse) → Task 4. My huddle → Task 6. Supporting (role-scoped) → Tasks 7+9. Encouragement sheet → Tasks 8+9. Encouragements Received/Sent → Task 11. Huddle toggle → Task 10. State (`inApp`, `activeTab`, `supporting`, `encouragements`, `enterApp`, `setTab`, `sendEncouragement`) → Task 2. Seeded demo data + coherence → Task 2. Science notes (Gollwitzer/Bolger/"Kudos"/Bandura) → Tasks 6, 9, 11 + existing ReturnView. Availability-only non-actionable → Task 7. Guardrails (no streaks/points; ≤3 accents) → verified in Task 12.

**Deferred per spec (intentionally not tasks):** Vision board, Rewards, Notifications, Settings; role-editing end-to-end (the `▾` is omitted — My Huddle pills are display-only, inline add covers the "add anytime" story); repeated-vs-one-off actions. The Goals-tab re-offer path to `OfferedSocial` is not reachable in the seeded demo (supporters are non-empty), so cross-routing from the shell is avoided.

**Type/name consistency:** `enterApp`/`setTab`/`sendEncouragement({ toName, message })`, `activeTab`, `inApp`, `state.supporting`, `state.encouragements.{received,sent}`, `role.shareLabel`, `onAct(person, mode)` with `mode ∈ {'cheer','checkin'}`, `SegmentedToggle({ options, value, onChange })`, `EncouragementSheet({ person, contextLine, presets, onClose, onSend })` — all consistent across tasks.

**Placeholder scan:** No TBD/TODO; every code step has complete code. The two Task-4 stubs are explicitly temporary and replaced in Tasks 10–11.
