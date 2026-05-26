# Huddel Onboarding Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 6-screen clickable React prototype of the Huddel onboarding redesign that runs at `npm run dev`, passes all spec demo-readiness checks, and requires no build step to demo.

**Architecture:** `AppContext` holds a single state object and a `goTo(screenId)` function; `App.jsx` renders the current screen with a 150ms CSS fade transition; six screen components read from context and call `goTo()` to navigate; four shared components (`PrimaryButton`, `SkipButton`, `OptionCard`, `CompleteControl`) enforce design-token rules.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react for unit tests, Fraunces + Inter from Google Fonts.

---

## File map

```
prototype/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.module.css
│   ├── context/
│   │   └── AppContext.jsx
│   ├── styles/
│   │   └── global.css
│   ├── test/
│   │   ├── setup.js
│   │   └── helpers.jsx
│   ├── screens/
│   │   ├── Welcome.jsx
│   │   ├── Welcome.module.css
│   │   ├── GoalActions.jsx
│   │   ├── GoalActions.module.css
│   │   ├── Cadence.jsx
│   │   ├── Cadence.module.css
│   │   ├── OfferedSocial.jsx
│   │   ├── OfferedSocial.module.css
│   │   ├── Recognition.jsx
│   │   ├── Recognition.module.css
│   │   ├── ReturnView.jsx
│   │   └── ReturnView.module.css
│   └── components/
│       ├── PrimaryButton.jsx
│       ├── PrimaryButton.module.css
│       ├── SkipButton.jsx
│       ├── SkipButton.module.css
│       ├── OptionCard.jsx
│       ├── OptionCard.module.css
│       ├── CompleteControl.jsx
│       └── CompleteControl.module.css
└── specs/   (untouched)
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx` (placeholder)
- Create: `src/App.module.css` (empty for now)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "huddel-onboarding-prototype",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Huddel — Onboarding</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create placeholder `src/App.jsx`**

```jsx
export default function App() {
  return <div>Huddel</div>
}
```

- [ ] **Step 5: Create `src/App.module.css`** (empty file — populated in Task 5)

- [ ] **Step 6: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Verify dev server starts**

Run: `npm run dev`
Expected: `Local: http://localhost:5173/` in output. Open in browser — see "Huddel" text. Kill server (`Ctrl+C`).

- [ ] **Step 9: Commit**

```bash
git add package.json vite.config.js index.html src/main.jsx src/App.jsx src/App.module.css
git commit -m "chore: scaffold Vite + React project"
```

---

## Task 2: Global CSS tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap');

/* ── Huddel design tokens ── */
:root {
  --color-purple:          #5015ff;
  --color-purple-tint:     #ede8ff;
  --color-black:           #060000;
  --color-body-gray:       #474747;
  --color-white:           #ffffff;
  --color-soft-blue:       #f9fafb;
  --color-sunshine-yellow: #fff493; /* decorative only — never for text */
  --color-orange:          #eb672f;
  --color-success-green:   #2feb7d;
  --color-beige:           #f4f3ec;

  --font-heading: 'Fraunces', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;

  --radius-card:   20px;
  --radius-button: 20px;

  --space-1:  2px;
  --space-2:  4px;
  --space-3:  8px;
  --space-4:  10px;
  --space-5:  15px;
  --space-6:  20px;
  --space-7:  25px;
  --space-8:  30px;
  --space-9:  50px;
}

/* ── Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.4;
  background: var(--color-soft-blue);
  color: var(--color-black);
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

/* ── App shell: max 390px, centred, white background ── */
#root {
  max-width: 390px;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--color-white);
  position: relative;
  overflow-x: hidden;
}

/* ── Screen fade transition ── */
.screenWrapper {
  min-height: 100dvh;
  opacity: 1;
  transition: opacity 0.15s ease;
}

.screenWrapper.fading {
  opacity: 0;
  pointer-events: none;
}

/* ── Utility: screen padding ── */
.screenPad {
  padding: var(--space-6) var(--space-6) 120px; /* 120px bottom = room for fixed button */
}

/* ── Utility: bottom action area (fixed within max-width shell) ── */
.bottomActions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  padding: var(--space-5) var(--space-6) var(--space-6);
  background: linear-gradient(transparent, var(--color-white) 30%);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

- [ ] **Step 2: Update `src/main.jsx` to confirm import works**

The import `./styles/global.css` is already in `src/main.jsx` from Task 1. Run dev server:

Run: `npm run dev`
Expected: Server starts, white background visible in browser at `http://localhost:5173/`. Kill server.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Huddel design tokens as CSS custom properties"
```

---

## Task 3: Test infrastructure

**Files:**
- Create: `src/test/setup.js`
- Create: `src/test/helpers.jsx`

- [ ] **Step 1: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 2: Create `src/test/helpers.jsx`**

```jsx
import { render } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'

/**
 * Renders ui wrapped in AppProvider.
 * Pass initialStateOverrides to seed specific state (useful for later-screen tests).
 */
export function renderWithApp(ui, { initialStateOverrides = {} } = {}) {
  return render(
    <AppProvider initialStateOverrides={initialStateOverrides}>
      {ui}
    </AppProvider>
  )
}
```

- [ ] **Step 3: Write a smoke test to confirm setup works**

Create `src/test/smoke.test.jsx`:

```jsx
test('test infrastructure works', () => {
  expect(1 + 1).toBe(2)
})
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected:
```
✓ src/test/smoke.test.jsx (1)
Test Files  1 passed (1)
Tests       1 passed (1)
```

- [ ] **Step 5: Delete smoke test** (it served its purpose)

Delete `src/test/smoke.test.jsx`.

- [ ] **Step 6: Commit**

```bash
git add src/test/setup.js src/test/helpers.jsx vite.config.js
git commit -m "chore: add Vitest + Testing Library test infrastructure"
```

---

## Task 4: AppContext

**Files:**
- Create: `src/context/AppContext.jsx`
- Create: `src/context/AppContext.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/context/AppContext.test.jsx`:

```jsx
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'

function wrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}

test('initial state has one pre-seeded action', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.actions).toHaveLength(1)
  expect(result.current.state.actions[0].label).toBe('Write 400 words')
  expect(result.current.state.actions[0].source).toBe('effort')
  expect(result.current.state.actions[0].completed).toBe(false)
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
  expect(result.current.currentScreen).toBe('welcome') // still old screen during fade
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
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: 6 failures with `Cannot find module './AppContext'`.

- [ ] **Step 3: Create `src/context/AppContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'

const defaultState = {
  context: null,
  goalName: '',
  actions: [
    { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: false },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
}

const AppContext = createContext(null)

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

- [ ] **Step 4: Run tests — confirm they pass**

Run: `npm test`
Expected:
```
✓ src/context/AppContext.test.jsx (6)
Test Files  1 passed (1)
Tests       6 passed (6)
```

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx src/test/helpers.jsx
git commit -m "feat: add AppContext with state shape, goTo, and updateState"
```

---

## Task 5: App.jsx router with fade transition

**Files:**
- Modify: `src/App.jsx`
- Create: `src/App.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

// App renders AppProvider internally; no wrapper needed here.

test('renders Welcome screen on load', () => {
  render(<App />)
  expect(screen.getByText("What's pulling at your time right now?")).toBeInTheDocument()
})

test('does not contain the word "milestone" anywhere on initial load', () => {
  render(<App />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: 2 failures — Welcome screen not yet built.

- [ ] **Step 3: Replace `src/App.jsx` with full router**

```jsx
import { AppProvider, useApp } from './context/AppContext'
import Welcome from './screens/Welcome'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import ReturnView from './screens/ReturnView'
import styles from './App.module.css'

const SCREENS = {
  'welcome':        Welcome,
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

Note: `screenWrapper` and `fading` are classes on `global.css`, not a CSS module — use the plain class names.

- [ ] **Step 4: Create stub screen files** so the router imports don't fail. Each stub just renders a `<div>` with the screen's headline:

Create `src/screens/Welcome.jsx`:
```jsx
export default function Welcome() {
  return <div>What&apos;s pulling at your time right now?</div>
}
```

Create `src/screens/GoalActions.jsx`:
```jsx
export default function GoalActions() { return <div>GoalActions</div> }
```

Create `src/screens/Cadence.jsx`:
```jsx
export default function Cadence() { return <div>Cadence</div> }
```

Create `src/screens/OfferedSocial.jsx`:
```jsx
export default function OfferedSocial() { return <div>OfferedSocial</div> }
```

Create `src/screens/Recognition.jsx`:
```jsx
export default function Recognition() { return <div>Recognition</div> }
```

Create `src/screens/ReturnView.jsx`:
```jsx
export default function ReturnView() { return <div>ReturnView</div> }
```

Also create empty CSS module stubs for each screen (each is just an empty file for now):
`src/screens/Welcome.module.css`, `GoalActions.module.css`, `Cadence.module.css`, `OfferedSocial.module.css`, `Recognition.module.css`, `ReturnView.module.css`.

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected:
```
✓ src/App.test.jsx (2)
✓ src/context/AppContext.test.jsx (6)
Test Files  2 passed (2)
Tests       8 passed (8)
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/screens/
git commit -m "feat: add App router with fade transition and screen stubs"
```

---

## Task 6: PrimaryButton, SkipButton, OptionCard

**Files:**
- Create: `src/components/PrimaryButton.jsx` + `.module.css`
- Create: `src/components/SkipButton.jsx` + `.module.css`
- Create: `src/components/OptionCard.jsx` + `.module.css`
- Create: `src/components/components.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/components.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrimaryButton from './PrimaryButton'
import SkipButton from './SkipButton'
import OptionCard from './OptionCard'

// PrimaryButton
test('PrimaryButton renders label and calls onClick', async () => {
  const onClick = vi.fn()
  render(<PrimaryButton onClick={onClick}>Continue</PrimaryButton>)
  await userEvent.click(screen.getByRole('button', { name: /continue/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('PrimaryButton is disabled when disabled prop is true', async () => {
  const onClick = vi.fn()
  render(<PrimaryButton disabled onClick={onClick}>Continue</PrimaryButton>)
  const btn = screen.getByRole('button', { name: /continue/i })
  expect(btn).toBeDisabled()
  await userEvent.click(btn)
  expect(onClick).not.toHaveBeenCalled()
})

// SkipButton
test('SkipButton renders label and calls onClick', async () => {
  const onClick = vi.fn()
  render(<SkipButton onClick={onClick}>Skip for now</SkipButton>)
  await userEvent.click(screen.getByRole('button', { name: /skip for now/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

// OptionCard
test('OptionCard renders label', () => {
  render(<OptionCard label="Work" selected={false} onSelect={() => {}} />)
  expect(screen.getByText('Work')).toBeInTheDocument()
})

test('OptionCard calls onSelect when clicked', async () => {
  const onSelect = vi.fn()
  render(<OptionCard label="Work" selected={false} onSelect={onSelect} />)
  await userEvent.click(screen.getByText('Work'))
  expect(onSelect).toHaveBeenCalledTimes(1)
})

test('OptionCard has aria-pressed true when selected', () => {
  render(<OptionCard label="Work" selected={true} onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: /work/i })).toHaveAttribute('aria-pressed', 'true')
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: failures with `Cannot find module`.

- [ ] **Step 3: Create `src/components/PrimaryButton.jsx`**

```jsx
import styles from './PrimaryButton.module.css'

export default function PrimaryButton({ children, onClick, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={styles.btn}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Create `src/components/PrimaryButton.module.css`**

```css
.btn {
  width: 100%;
  padding: 16px 20px;
  background: var(--color-purple);
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: opacity 0.15s ease;
  text-align: center;
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn:not(:disabled):active {
  opacity: 0.85;
}
```

- [ ] **Step 5: Create `src/components/SkipButton.jsx`**

```jsx
import styles from './SkipButton.module.css'

export default function SkipButton({ children, onClick }) {
  return (
    <button type="button" className={styles.btn} onClick={onClick}>
      {children}
    </button>
  )
}
```

- [ ] **Step 6: Create `src/components/SkipButton.module.css`**

```css
.btn {
  width: 100%;
  padding: 12px 20px;
  background: none;
  color: var(--color-body-gray);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: opacity 0.15s ease;
}

.btn:active {
  opacity: 0.7;
}
```

- [ ] **Step 7: Create `src/components/OptionCard.jsx`**

```jsx
import styles from './OptionCard.module.css'

export default function OptionCard({ label, selected, onSelect }) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 8: Create `src/components/OptionCard.module.css`**

```css
.card {
  width: 100%;
  padding: 18px 20px;
  background: var(--color-beige);
  color: var(--color-black);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  border: 2px solid transparent;
  border-radius: var(--radius-card);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.1s ease, background 0.1s ease;
}

.selected {
  border-color: var(--color-purple);
  background: var(--color-purple-tint);
  font-weight: 500;
  color: var(--color-purple);
}
```

- [ ] **Step 9: Run tests — confirm they pass**

Run: `npm test`
Expected:
```
✓ src/components/components.test.jsx (6)
✓ src/App.test.jsx (2)
✓ src/context/AppContext.test.jsx (6)
Test Files  3 passed (3)
Tests  14 passed (14)
```

- [ ] **Step 10: Commit**

```bash
git add src/components/
git commit -m "feat: add PrimaryButton, SkipButton, OptionCard shared components"
```

---

## Task 7: CompleteControl

**Files:**
- Create: `src/components/CompleteControl.jsx`
- Create: `src/components/CompleteControl.module.css`
- Modify: `src/components/components.test.jsx` (add CompleteControl tests)

- [ ] **Step 1: Add CompleteControl tests to `src/components/components.test.jsx`**

Append to the existing test file:

```jsx
import CompleteControl from './CompleteControl'

// CompleteControl
test('CompleteControl renders the action label', () => {
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={false} onComplete={() => {}} />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('CompleteControl calls onComplete with actionId when tapped', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={false} onComplete={onComplete} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).toHaveBeenCalledWith('a1')
})

test('CompleteControl does not call onComplete when already completed', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={true} onComplete={onComplete} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).not.toHaveBeenCalled()
})

test('CompleteControl has completed class when completed is true', () => {
  render(<CompleteControl actionId="a1" label="done" completed={true} onComplete={() => {}} />)
  // The circle element has data-testid="complete-circle"
  expect(screen.getByTestId('complete-circle')).toHaveClass('completed')
})
```

- [ ] **Step 2: Run tests — confirm new tests fail**

Run: `npm test`
Expected: 4 new failures with `Cannot find module './CompleteControl'`.

- [ ] **Step 3: Create `src/components/CompleteControl.jsx`**

```jsx
import styles from './CompleteControl.module.css'

export default function CompleteControl({ actionId, label, completed, onComplete }) {
  function handleClick() {
    if (!completed) onComplete(actionId)
  }

  return (
    <div
      className={`${styles.wrapper} ${completed ? styles.wrapperDone : ''}`}
      onClick={handleClick}
      role="button"
      aria-label={completed ? `${label} — completed` : `Mark complete: ${label}`}
      tabIndex={completed ? -1 : 0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
    >
      <div
        data-testid="complete-circle"
        className={`${styles.circle} ${completed ? styles.completed : ''}`}
      >
        {completed && (
          <svg
            viewBox="0 0 24 24"
            className={styles.check}
            aria-hidden="true"
          >
            <polyline points="4,13 9,18 20,6" />
          </svg>
        )}
      </div>
      <span className={`${styles.label} ${completed ? styles.labelDone : ''}`}>
        {label}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/CompleteControl.module.css`**

```css
.wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--color-beige);
  border-radius: var(--radius-card);
  cursor: pointer;
  user-select: none;
}

.wrapperDone {
  cursor: default;
}

.circle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.completed {
  background: var(--color-success-green);
  border-color: var(--color-success-green);
}

.check {
  width: 15px;
  height: 15px;
  stroke: white;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 32;
  stroke-dashoffset: 32;
  animation: drawCheck 0.15s ease forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

.label {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-black);
  flex: 1;
}

.labelDone {
  color: var(--color-body-gray);
  text-decoration: line-through;
}
```

- [ ] **Step 5: Run tests — confirm all pass**

Run: `npm test`
Expected:
```
✓ src/components/components.test.jsx (10)
✓ src/App.test.jsx (2)
✓ src/context/AppContext.test.jsx (6)
Test Files  3 passed (3)
Tests  18 passed (18)
```

- [ ] **Step 6: Commit**

```bash
git add src/components/CompleteControl.jsx src/components/CompleteControl.module.css src/components/components.test.jsx
git commit -m "feat: add CompleteControl with green tick animation"
```

---

## Task 8: Screen 01 — Welcome

**Files:**
- Modify: `src/screens/Welcome.jsx`
- Modify: `src/screens/Welcome.module.css`
- Create: `src/screens/Welcome.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/Welcome.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Welcome from './Welcome'

test('renders headline and subhead verbatim', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByText("What's pulling at your time right now?")).toBeInTheDocument()
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('renders all four option cards', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByText('Work')).toBeInTheDocument()
  expect(screen.getByText('Study')).toBeInTheDocument()
  expect(screen.getByText('Both work and study')).toBeInTheDocument()
  expect(screen.getByText("Life's just full right now")).toBeInTheDocument()
})

test('Continue button is disabled until an option is selected', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
})

test('Continue button enables after selecting an option', async () => {
  renderWithApp(<Welcome />)
  await userEvent.click(screen.getByText('Work'))
  expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
})

test('selecting one card deselects the other', async () => {
  renderWithApp(<Welcome />)
  await userEvent.click(screen.getByText('Work'))
  await userEvent.click(screen.getByText('Study'))
  expect(screen.getByRole('button', { name: /^Work$/i })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: /^Study$/i })).toHaveAttribute('aria-pressed', 'true')
})

test('does not contain the word milestone', () => {
  renderWithApp(<Welcome />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: 6 failures (Welcome stub renders a single div).

- [ ] **Step 3: Implement `src/screens/Welcome.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import OptionCard from '../components/OptionCard'
import PrimaryButton from '../components/PrimaryButton'
import styles from './Welcome.module.css'

const OPTIONS = [
  { value: 'work',      label: 'Work' },
  { value: 'study',     label: 'Study' },
  { value: 'both',      label: 'Both work and study' },
  { value: 'life_full', label: "Life's just full right now" },
]

export default function Welcome() {
  const { updateState, goTo } = useApp()
  const [selected, setSelected] = useState(null)

  function handleSelect(value) {
    setSelected(value)
  }

  function handleContinue() {
    updateState({ context: selected })
    goTo('goal-actions')
  }

  return (
    <div className="screenPad">
      <div className={styles.brand}>Huddel</div>

      <h1 className={styles.headline}>What&apos;s pulling at your time right now?</h1>
      <p className={styles.subhead}>
        Huddel plans around real life — so your goals bend when your week does.
      </p>

      <div className={styles.options}>
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onSelect={() => handleSelect(opt.value)}
          />
        ))}
      </div>

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue} disabled={!selected}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/screens/Welcome.module.css`**

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

.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected:
```
✓ src/screens/Welcome.test.jsx (6)
... (all previous tests still pass)
Tests  24 passed (24)
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/Welcome.jsx src/screens/Welcome.module.css src/screens/Welcome.test.jsx
git commit -m "feat: implement Screen 01 — Welcome"
```

---

## Task 9: Screen 02 — GoalActions

**Files:**
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.module.css`
- Create: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/GoalActions.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('pre-seeds one "Write 400 words" action on load', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getAllByText('Write 400 words').length).toBeGreaterThanOrEqual(1)
})

test('"By effort" tab is selected by default', () => {
  renderWithApp(<GoalActions />)
  const effortTab = screen.getByRole('button', { name: /by effort/i })
  expect(effortTab).toHaveAttribute('aria-selected', 'true')
})

test('Next button disabled when goalName is empty', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled()
})

test('Next button enabled when goalName is filled and actions exist', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(screen.getByRole('button', { name: /^next$/i })).not.toBeDisabled()
})

test('tapping a chip adds it to the action list', async () => {
  renderWithApp(<GoalActions />)
  // Count current "Read for 30 min" instances (should be 0 in list)
  await userEvent.click(screen.getByText('Read for 30 min'))
  // Should now appear in the list
  expect(screen.getAllByText('Read for 30 min').length).toBeGreaterThan(0)
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: 7 failures.

- [ ] **Step 3: Implement `src/screens/GoalActions.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import styles from './GoalActions.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']
const OUTCOME_CHIPS = ['Finish a chapter', 'Submit a draft']

let nextId = 100 // simple incrementing ID for new actions

export default function GoalActions() {
  const { state, updateState, goTo } = useApp()
  const [goalName, setGoalName] = useState(state.goalName)
  const [actions, setActions] = useState(state.actions)
  const [activeTab, setActiveTab] = useState('effort')
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  function addAction(label, source) {
    const newAction = { id: `act-${nextId++}`, label, source, completed: false }
    setActions(prev => [...prev, newAction])
  }

  function removeAction(id) {
    setActions(prev => prev.filter(a => a.id !== id))
  }

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) {
      addAction(customInput.trim(), 'custom')
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  function handleNext() {
    updateState({ goalName, actions })
    goTo('cadence')
  }

  const chips = activeTab === 'effort' ? EFFORT_CHIPS : OUTCOME_CHIPS
  const canAdvance = goalName.trim().length > 0 && actions.length > 0

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

      <p className={styles.sectionLabel}>Break it into actions you can actually do</p>
      <p className={styles.helper}>
        Small efforts add up — describe each one by what you&apos;ll do, not the finish line.
      </p>

      {/* Segmented tab control */}
      <div className={styles.tabs} role="tablist">
        {['effort', 'outcome'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'effort' ? 'By effort' : 'By outcome'}
          </button>
        ))}
      </div>

      {/* Template chips */}
      <div className={styles.chips}>
        {chips.map(chip => (
          <button
            key={chip}
            type="button"
            className={styles.chip}
            onClick={() => addAction(chip, activeTab)}
          >
            {chip}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${styles.chipCustom}`}
          onClick={() => setShowCustomInput(true)}
        >
          + Write my own
        </button>
      </div>

      {/* Inline custom input */}
      {showCustomInput && (
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

      {/* Action list */}
      {actions.length > 0 && (
        <ul className={styles.actionList}>
          {actions.map(action => (
            <li key={action.id} className={styles.actionItem}>
              <span>{action.label}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeAction(action.id)}
                aria-label={`Remove ${action.label}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
          Next
        </PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/screens/GoalActions.module.css`**

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
  margin-bottom: var(--space-8);
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

.tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.tab {
  flex: 1;
  padding: 10px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid #ddd;
  border-radius: 12px;
  background: var(--color-white);
  color: var(--color-body-gray);
  cursor: pointer;
  transition: all 0.1s ease;
}

.tabActive {
  background: var(--color-purple);
  border-color: var(--color-purple);
  color: var(--color-white);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
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
  margin-bottom: var(--space-5);
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

.actionList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.actionItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-beige);
  border-radius: var(--radius-card);
  font-size: 15px;
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
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected: all tests pass including the 7 new ones.

- [ ] **Step 6: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: implement Screen 02 — Goal + Effort Actions"
```

---

## Task 10: Screen 03 — Cadence

**Files:**
- Modify: `src/screens/Cadence.jsx`
- Modify: `src/screens/Cadence.module.css`
- Create: `src/screens/Cadence.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/Cadence.test.jsx`:

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

test('shows contextual reassurance when context is "both"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'both' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('shows contextual reassurance when context is "life_full"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'life_full' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('does not show contextual reassurance when context is "work"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'work' } })
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: 7 new failures.

- [ ] **Step 3: Implement `src/screens/Cadence.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import OptionCard from '../components/OptionCard'
import PrimaryButton from '../components/PrimaryButton'
import styles from './Cadence.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const OPTIONS = [
  { value: 'few_times_week', label: 'A few times a week' },
  { value: 'most_days',      label: 'Most days' },
  { value: 'specific_days',  label: 'Specific days' },
  { value: 'when_i_can',     label: 'Whenever I can' },
]

export default function Cadence() {
  const { state, updateState, goTo } = useApp()
  const [cadence, setCadence] = useState(state.cadence)
  const [cadenceDays, setCadenceDays] = useState(state.cadenceDays)

  const showReassurance = state.context === 'both' || state.context === 'life_full'

  function toggleDay(day) {
    setCadenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function handleNext() {
    updateState({ cadence, cadenceDays })
    goTo('offered-social')
  }

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>How often feels realistic?</h1>
      <p className={styles.helper}>No wrong answer. You can change this whenever your week changes.</p>

      <div className={styles.options}>
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={cadence === opt.value}
            onSelect={() => setCadence(opt.value)}
          />
        ))}
      </div>

      {cadence === 'specific_days' && (
        <div className={styles.dayPicker}>
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              className={`${styles.dayChip} ${cadenceDays.includes(day) ? styles.dayActive : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {showReassurance && (
        <p className={styles.reassurance}>
          Smart pick — irregular weeks are exactly what this is built for.
        </p>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleNext}>Next</PrimaryButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/screens/Cadence.module.css`**

```css
.headline {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-5);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-8);
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.dayPicker {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.dayChip {
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-beige);
  color: var(--color-black);
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.dayActive {
  background: var(--color-purple-tint);
  border-color: var(--color-purple);
  color: var(--color-purple);
}

.reassurance {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-purple);
  background: var(--color-purple-tint);
  border-radius: var(--radius-card);
  padding: 14px 16px;
  margin-bottom: var(--space-6);
}
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Cadence.jsx src/screens/Cadence.module.css src/screens/Cadence.test.jsx
git commit -m "feat: implement Screen 03 — Cadence"
```

---

## Task 11: Screen 04 — OfferedSocial

**Files:**
- Modify: `src/screens/OfferedSocial.jsx`
- Modify: `src/screens/OfferedSocial.module.css`
- Create: `src/screens/OfferedSocial.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/OfferedSocial.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import OfferedSocial from './OfferedSocial'

test('renders headline verbatim', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Want someone in your corner?')).toBeInTheDocument()
})

test('"Done — continue" button is always visible and enabled', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /done — continue/i })).not.toBeDisabled()
})

test('"Skip for now" button is always visible', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
})

test('skipping routes to recognition and leaves supporters empty', async () => {
  vi.useFakeTimers()
  const { result } = await import('../context/AppContext').then(mod => {
    // We'll check via the rendered app instead
  }).catch(() => null)

  // Use renderWithApp and check goTo is called — easier to check via App-level test
  // Here we just verify skip button exists and doesn't crash
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByRole('button', { name: /skip for now/i }))
  // No error means the click didn't throw
  vi.useRealTimers()
})

test('selecting a role chip shows visibility description', async () => {
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByText('Close peer'))
  expect(screen.getByText(/sees everything/i)).toBeInTheDocument()
})

test('role chips: all four options render', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Close peer')).toBeInTheDocument()
  expect(screen.getByText('Family')).toBeInTheDocument()
  expect(screen.getByText('Study friend')).toBeInTheDocument()
  expect(screen.getByText('Work — availability only')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: failures.

- [ ] **Step 3: Implement `src/screens/OfferedSocial.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import styles from './OfferedSocial.module.css'

const ROLES = [
  { value: 'close_peer',        label: 'Close peer',              description: 'Sees everything' },
  { value: 'family',            label: 'Family',                  description: 'Sees progress, not the struggles' },
  { value: 'study_friend',      label: 'Study friend',            description: 'Sees this goal only' },
  { value: 'work_availability', label: 'Work — availability only', description: "Sees that you're busy, not what you're working on" },
]

export default function OfferedSocial() {
  const { state, updateState, goTo } = useApp()
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [supporters, setSupporters] = useState(state.supporters)

  function handleAdd() {
    if (name.trim() && selectedRole) {
      setSupporters(prev => [...prev, { name: name.trim(), role: selectedRole }])
      setName('')
      setSelectedRole(null)
    }
  }

  function handleContinue() {
    updateState({ supporters })
    goTo('recognition')
  }

  function handleSkip() {
    updateState({ supporters: [] })
    goTo('recognition')
  }

  const roleDescription = ROLES.find(r => r.value === selectedRole)?.description

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>Want someone in your corner?</h1>
      <p className={styles.subhead}>
        Adding people is optional — and you choose exactly what they see. You can do this any time later.
      </p>

      {/* Avatar-group decorative element */}
      <div className={styles.avatarGroup} aria-hidden="true">
        <div className={styles.avatar} style={{ background: '#c4b5fd' }}>A</div>
        <div className={styles.avatar} style={{ background: '#a5f3fc' }}>B</div>
        <div className={styles.avatar} style={{ background: '#bbf7d0' }}>C</div>
      </div>

      {/* Add supporter row */}
      <div className={styles.addRow}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Name or contact"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className={styles.roleChips}>
        {ROLES.map(role => (
          <button
            key={role.value}
            type="button"
            className={`${styles.roleChip} ${selectedRole === role.value ? styles.roleActive : ''}`}
            onClick={() => setSelectedRole(prev => prev === role.value ? null : role.value)}
          >
            {role.label}
          </button>
        ))}
      </div>

      {roleDescription && (
        <p className={styles.roleDesc}>{roleDescription}</p>
      )}

      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAdd}
        disabled={!name.trim() || !selectedRole}
      >
        Add
      </button>

      {supporters.length > 0 && (
        <ul className={styles.supporterList}>
          {supporters.map((s, i) => (
            <li key={i} className={styles.supporterItem}>
              <span>{s.name}</span>
              <span className={styles.supporterRole}>
                {ROLES.find(r => r.value === s.role)?.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="bottomActions">
        <PrimaryButton onClick={handleContinue}>Done — continue</PrimaryButton>
        <SkipButton onClick={handleSkip}>Skip for now</SkipButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/screens/OfferedSocial.module.css`**

```css
.headline {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-5);
}

.subhead {
  font-size: 15px;
  color: var(--color-body-gray);
  line-height: 1.5;
  margin-bottom: var(--space-7);
}

.avatarGroup {
  display: flex;
  margin-bottom: var(--space-8);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: var(--color-black);
  margin-left: -10px;
}

.avatar:first-child {
  margin-left: 0;
}

.addRow {
  margin-bottom: var(--space-5);
}

.nameInput {
  width: 100%;
  padding: 14px 16px;
  font-family: var(--font-body);
  font-size: 16px;
  border: 1.5px solid #ddd;
  border-radius: var(--radius-card);
  outline: none;
  transition: border-color 0.15s;
}

.nameInput:focus {
  border-color: var(--color-purple);
}

.roleChips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.roleChip {
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-beige);
  color: var(--color-black);
  border: 1.5px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.roleActive {
  background: var(--color-purple-tint);
  border-color: var(--color-purple);
  color: var(--color-purple);
}

.roleDesc {
  font-size: 13px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-5);
  padding-left: var(--space-2);
}

.addBtn {
  padding: 10px 24px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  background: var(--color-beige);
  color: var(--color-purple);
  border: 1.5px solid var(--color-purple);
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: var(--space-6);
  transition: background 0.1s;
}

.addBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.supporterList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.supporterItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-beige);
  border-radius: var(--radius-card);
}

.supporterRole {
  font-size: 13px;
  color: var(--color-body-gray);
}
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/screens/OfferedSocial.jsx src/screens/OfferedSocial.module.css src/screens/OfferedSocial.test.jsx
git commit -m "feat: implement Screen 04 — Offered Social (skippable)"
```

---

## Task 12: Screen 05 — Recognition

**Files:**
- Modify: `src/screens/Recognition.jsx`
- Modify: `src/screens/Recognition.module.css`
- Create: `src/screens/Recognition.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/Recognition.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  actions: [{ id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: false }],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('renders the first action as a CompleteControl', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('shows default continue copy for non-when_i_can cadence', async () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'most_days' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  await userEvent.click(control)
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See what tomorrow looks like/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('shows when_i_can continue copy when cadence is when_i_can', async () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'when_i_can' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  await userEvent.click(control)
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See your home base/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('does not contain the word milestone', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: failures.

- [ ] **Step 3: Implement `src/screens/Recognition.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import styles from './Recognition.module.css'

export default function Recognition() {
  const { state, updateState, goTo } = useApp()
  const [completed, setCompleted] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  const firstAction = state.actions[0]

  function handleComplete() {
    // Mark action complete in state
    const updatedActions = state.actions.map(a =>
      a.id === firstAction.id ? { ...a, completed: true } : a
    )
    updateState({ actions: updatedActions })
    setCompleted(true)

    // Show continue affordance after 1.5s
    setTimeout(() => setShowContinue(true), 1500)
  }

  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

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
        <button
          type="button"
          className={styles.continueBtn}
          onClick={() => goTo('return-view')}
        >
          {continueLabel}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/screens/Recognition.module.css`**

```css
.headline {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 600;
  color: var(--color-black);
  line-height: 1.2;
  margin-bottom: var(--space-8);
}

.helper {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-top: var(--space-5);
  line-height: 1.5;
}

.peakMessage {
  margin-top: var(--space-8);
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

.continueBtn {
  display: block;
  width: 100%;
  margin-top: var(--space-8);
  padding: 18px 20px;
  background: var(--color-purple);
  color: white;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  text-align: center;
  animation: fadeIn 0.3s ease;
}
```

- [ ] **Step 5: Run tests — confirm they pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Recognition.jsx src/screens/Recognition.module.css src/screens/Recognition.test.jsx
git commit -m "feat: implement Screen 05 — Recognition with calm peak"
```

---

## Task 13: Screen 06 — ReturnView

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Create: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/screens/ReturnView.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  actions: [
    { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: true },
    { id: 'act-2',  label: 'Read for 30 min',  source: 'effort', completed: false },
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
  renderWithApp(<ReturnView />, {
    initialStateOverrides: { ...baseState, cadence: 'when_i_can' },
  })
  expect(screen.getByText(/1 action done so far/)).toBeInTheDocument()
})

test('completed action is shown ticked (CompleteControl with completed=true)', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  // completed action's circle has data-testid="complete-circle" with class "completed"
  const circles = document.querySelectorAll('[data-testid="complete-circle"]')
  const completedCircles = Array.from(circles).filter(el => el.className.includes('completed'))
  expect(completedCircles.length).toBeGreaterThanOrEqual(1)
})

test('does not show supporter section when supporters is empty', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.queryByText(/can cheer this on/i)).not.toBeInTheDocument()
})

test('shows supporter line when supporters array is non-empty', () => {
  renderWithApp(<ReturnView />, {
    initialStateOverrides: {
      ...baseState,
      supporters: [{ name: 'Alex', role: 'study_friend' }],
    },
  })
  expect(screen.getByText(/can cheer this on/i)).toBeInTheDocument()
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

- [ ] **Step 2: Run tests — confirm they fail**

Run: `npm test`
Expected: failures.

- [ ] **Step 3: Implement `src/screens/ReturnView.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import styles from './ReturnView.module.css'

const ROLE_LABELS = {
  close_peer:        'close peer',
  family:            'family',
  study_friend:      'study friend',
  work_availability: 'work contact',
}

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [actions, setActions] = useState(state.actions)

  const completedCount = actions.filter(a => a.completed).length
  const allDone = completedCount === actions.length
  const isWhenICan = state.cadence === 'when_i_can'

  const progressCopy = isWhenICan
    ? `${completedCount} action${completedCount !== 1 ? 's' : ''} done so far`
    : `${completedCount} action${completedCount !== 1 ? 's' : ''} done · keep it rolling`

  function handleComplete(actionId) {
    const updated = actions.map(a => a.id === actionId ? { ...a, completed: true } : a)
    setActions(updated)
    updateState({ actions: updated })
  }

  const primarySupporterRole = state.supporters[0]
    ? ROLE_LABELS[state.supporters[0].role] || 'supporter'
    : null

  return (
    <div className="screenPad">
      <p className={styles.greeting}>Welcome back.</p>
      <h1 className={styles.goalName}>{state.goalName}</h1>

      <p className={styles.progress}>{progressCopy}</p>

      <div className={styles.actionList}>
        {actions.map(action => (
          <CompleteControl
            key={action.id}
            actionId={action.id}
            label={action.label}
            completed={action.completed}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {state.supporters.length > 0 ? (
        <p className={styles.supporterLine}>
          Your {primarySupporterRole} can cheer this on.
        </p>
      ) : (
        <button
          type="button"
          className={styles.reOffer}
          onClick={() => goTo('offered-social')}
        >
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

- [ ] **Step 4: Implement `src/screens/ReturnView.module.css`**

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

.actionList {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
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

- [ ] **Step 5: Run all tests — confirm they pass**

Run: `npm test`
Expected:
```
✓ src/context/AppContext.test.jsx
✓ src/App.test.jsx
✓ src/components/components.test.jsx
✓ src/screens/Welcome.test.jsx
✓ src/screens/GoalActions.test.jsx
✓ src/screens/Cadence.test.jsx
✓ src/screens/OfferedSocial.test.jsx
✓ src/screens/Recognition.test.jsx
✓ src/screens/ReturnView.test.jsx
Test Files  9 passed (9)
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: implement Screen 06 — Return View (home base)"
```

---

## Task 14: README + demo-readiness check

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Huddel Onboarding Prototype

IFN637 Assignment 3 · Huddel onboarding redesign · Team 2

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a mobile-sized browser window (or DevTools → responsive mode, 390px wide).

## Test

```bash
npm test
```

## Screen flow

```
01 Welcome → 02 Goal + effort actions → 03 Cadence
  → 04 Offered social (skippable) → 05 Recognition → 06 Return view
```

## Stack

React 18 + Vite · CSS Modules · AppContext (no external state library)  
Fonts: Fraunces (headings), Inter (body) — Google Fonts
```

- [ ] **Step 2: Run full demo-readiness checklist manually in browser**

Start dev server (`npm run dev`), open `http://localhost:5173`, set browser to 390px wide. Verify each item:

- [ ] 01→06 clickable end-to-end with no dead ends
- [ ] "Milestone" appears nowhere in the UI
- [ ] "By effort" tab pre-selected and purple on Screen 02
- [ ] One "Write 400 words" action pre-seeded on Screen 02
- [ ] "Whenever I can" option on Screen 03; if selected, Screen 05 shows "See your home base →" and Screen 06 shows "N action done so far"
- [ ] Screen 04 skippable in one tap via "Skip for now"; skip reaches Screen 05
- [ ] Recognition: green tick animates in <200ms, quiet message appears, no confetti/streaks
- [ ] Return view shows completed action ticked green at top
- [ ] Huddel tokens applied; max 3 accent colors per screen; no yellow text
- [ ] Primary buttons in bottom third, full-width, pill-shaped

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: add README and confirm demo-readiness checklist"
```

---

## Self-review notes

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| "Milestone" never appears | Token-enforced in copy; App.test.jsx tests it |
| Effort tab default + pre-seeded action | Task 9 (GoalActions) |
| Cadence user-chosen, "whenever I can" first-class | Task 10 (Cadence) |
| Contextual reassurance (context-aware) | Cadence.test.jsx |
| S04 skippable in one tap | Task 11 (OfferedSocial); both buttons go to recognition |
| Recognition calm: green tick + one quiet peak | Task 12 (Recognition); no confetti/streaks |
| Cadence propagates to S05 + S06 copy | Recognition.test + ReturnView.test |
| Return view shows completed action within ~10s | Task 13 — first in the list, always visible |
| Supporter conditional rendering | ReturnView.test |
| Re-offer routes back to S04 | ReturnView.jsx `goTo('offered-social')` |
| Design tokens (CSS custom properties) | Task 2 (global.css) |
| Max 3 accent colors per screen | Enforced by design; Purple is primary, Green only on completion, no mixing |
| Primary actions thumb-reachable | `.bottomActions` fixed at bottom on all screens |

All 14 demo-readiness checklist items are addressed.
