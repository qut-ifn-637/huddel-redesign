# Milestone Target Dates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, soft "target completion date" + explicit "reached" state to each milestone, derive a gentle status (Reached / On track / Due soon / Slipped), surface it on the home screen with a supportive "slipped" prompt, and make the supporter roles meaningful by showing a date-derived slip only to the Everything role.

**Architecture:** All date math lives in one pure, tested utility (`src/utils/milestoneStatus.js`). The data model gains two milestone fields; the editor (`MilestoneCard`) sets the date via quick presets; the home screen (`ReturnView`) reads the status helper to render chips, a "Reached it" toggle, and a slipped→support prompt; the demo supporter card (`SupportingCard`) renders a seeded slipped line by role. No new navigation, no backend.

**Tech Stack:** React 18, Vite, CSS Modules, Vitest + Testing Library (`renderWithApp` from `src/test/helpers.jsx`; Vitest globals enabled — `test`/`expect`/`vi` are global). Reference spec: `docs/superpowers/specs/2026-05-31-milestone-target-dates-design.md`.

---

### Task 1: Status utility (`src/utils/milestoneStatus.js`)

The pure core: status derivation, the soft date formatter, and preset-date math. Everything else depends on this, and it's the only piece with real logic — so it gets thorough unit tests with an injected `today`.

**Files:**
- Create: `src/utils/milestoneStatus.js`
- Create: `src/utils/milestoneStatus.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/milestoneStatus.test.js` with exactly this content:

```js
import { milestoneStatus, formatSoftDate, presetDate } from './milestoneStatus'

const today = new Date('2026-06-01T12:00:00')

test('reached milestone is "reached" regardless of date', () => {
  expect(milestoneStatus({ reached: true, targetDate: '2026-05-01' }, today)).toBe('reached')
})

test('milestone with no date is "none"', () => {
  expect(milestoneStatus({ reached: false, targetDate: null }, today)).toBe('none')
})

test('date in the past is "slipped"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-05-30' }, today)).toBe('slipped')
})

test('date today or within 3 days is "duesoon"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-01' }, today)).toBe('duesoon')
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-03' }, today)).toBe('duesoon')
})

test('date more than 3 days out is "ontrack"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-20' }, today)).toBe('ontrack')
})

test('formatSoftDate renders a soft "~DD Mon"', () => {
  expect(formatSoftDate('2026-06-14')).toBe('~14 Jun')
  expect(formatSoftDate(null)).toBe('')
})

test('presetDate computes ISO dates relative to today', () => {
  expect(presetDate('week', today)).toBe('2026-06-08')
  expect(presetDate('fortnight', today)).toBe('2026-06-15')
  expect(presetDate('month', today)).toBe('2026-07-01')
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/utils/milestoneStatus.test.js
```

Expected: FAIL — `Failed to resolve import "./milestoneStatus"`.

- [ ] **Step 3: Create the utility**

Create `src/utils/milestoneStatus.js` with exactly this content:

```js
const DAY_MS = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function milestoneStatus(milestone, today = new Date()) {
  if (milestone.reached) return 'reached'
  if (!milestone.targetDate) return 'none'
  const target = startOfDay(new Date(milestone.targetDate + 'T00:00:00'))
  const days = Math.round((target - startOfDay(today)) / DAY_MS)
  if (days < 0) return 'slipped'
  if (days <= 3) return 'duesoon'
  return 'ontrack'
}

export function formatSoftDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `~${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function presetDate(key, today = new Date()) {
  const d = startOfDay(today)
  if (key === 'week') d.setDate(d.getDate() + 7)
  else if (key === 'fortnight') d.setDate(d.getDate() + 14)
  else if (key === 'month') d.setMonth(d.getMonth() + 1)
  return toISO(d)
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/utils/milestoneStatus.test.js
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/milestoneStatus.js src/utils/milestoneStatus.test.js
git commit -m "feat: add milestoneStatus utility (status, soft date, presets)"
```

---

### Task 2: Data model (`src/context/AppContext.jsx`)

Add the two milestone fields to the default seed, and give the demo Everything-role supporter (Alex) a date-derived `slipped` line in place of the static `struggleFlag`.

**Files:**
- Modify: `src/context/AppContext.jsx`
- Create: `src/context/AppContext.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/context/AppContext.test.jsx` with exactly this content:

```jsx
import { screen } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import { useApp } from './AppContext'

function Probe() {
  const { state } = useApp()
  const m = state.milestones[0]
  const alex = state.supporting.find(p => p.name === 'Alex')
  return (
    <div>
      <span data-testid="td">{String(m.targetDate)}</span>
      <span data-testid="reached">{String(m.reached)}</span>
      <span data-testid="alex-slipped">{alex.slipped || ''}</span>
      <span data-testid="alex-struggle">{String(alex.struggleFlag)}</span>
    </div>
  )
}

test('default milestone has null targetDate and reached=false', () => {
  renderWithApp(<Probe />)
  expect(screen.getByTestId('td')).toHaveTextContent('null')
  expect(screen.getByTestId('reached')).toHaveTextContent('false')
})

test('demo supporter Alex has a slipped line and no struggleFlag', () => {
  renderWithApp(<Probe />)
  expect(screen.getByTestId('alex-slipped').textContent).toMatch(/slipped past/i)
  expect(screen.getByTestId('alex-struggle')).toHaveTextContent('undefined')
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/context/AppContext.test.jsx
```

Expected: FAIL — default milestone has no `targetDate`/`reached`; Alex still has `struggleFlag` and no `slipped`.

- [ ] **Step 3: Update the default milestone seed**

In `src/context/AppContext.jsx`, change the `milestones` default:

```js
// Before
  milestones: [
    { id: 'milestone-1', name: '', actions: [] },
  ],
// After
  milestones: [
    { id: 'milestone-1', name: '', actions: [], targetDate: null, reached: false },
  ],
```

- [ ] **Step 4: Update the demo Alex supporter**

In `src/context/AppContext.jsx`, change the `sg-1` entry:

```js
// Before
    { id: 'sg-1', name: 'Alex',   role: 'all',          goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true },
// After
    { id: 'sg-1', name: 'Alex',   role: 'all',          goal: 'Run a half-marathon', progress: '3 of 5 runs this week', slipped: '"Long run" slipped past 20 May' },
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/context/AppContext.test.jsx
```

Expected: both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: add targetDate/reached to milestones, slipped to demo supporter"
```

---

### Task 3: Date presets in the editor (`MilestoneCard.jsx` + `GoalActions.jsx`)

Add the "Hope to finish by · optional" preset row to the milestone editor, thread a new `onSetTargetDate` callback through `GoalActions`, and seed new milestones with the two fields.

**Files:**
- Modify: `src/components/MilestoneCard.jsx`
- Modify: `src/components/MilestoneCard.module.css`
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/components/MilestoneCard.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add these tests to the end of `src/components/MilestoneCard.test.jsx`. (The file already imports `render`, `screen`, `userEvent`, and `MilestoneCard`, and defines a `renderCard` helper — verify by reading the file head; if `renderCard` is absent, use `render(<MilestoneCard .../>)` directly with the props shown below.)

```jsx
const datedMilestone = { id: 'm1', name: 'Lit review', actions: [], targetDate: null, reached: false }

test('shows the optional target-date preset row when expanded', () => {
  render(<MilestoneCard milestone={datedMilestone} expanded={true}
    onToggle={() => {}} onRename={() => {}} onAddAction={() => {}}
    onRemoveAction={() => {}} onSetKind={() => {}} onSetTargetDate={() => {}} />)
  expect(screen.getByText(/hope to finish by/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '2 weeks' })).toBeInTheDocument()
})

test('clicking a preset calls onSetTargetDate with an ISO date', async () => {
  const onSetTargetDate = vi.fn()
  render(<MilestoneCard milestone={datedMilestone} expanded={true}
    onToggle={() => {}} onRename={() => {}} onAddAction={() => {}}
    onRemoveAction={() => {}} onSetKind={() => {}} onSetTargetDate={onSetTargetDate} />)
  await userEvent.click(screen.getByRole('button', { name: '2 weeks' }))
  expect(onSetTargetDate).toHaveBeenCalledTimes(1)
  expect(onSetTargetDate.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})

test('"Pick a date" reveals a native date input', async () => {
  render(<MilestoneCard milestone={datedMilestone} expanded={true}
    onToggle={() => {}} onRename={() => {}} onAddAction={() => {}}
    onRemoveAction={() => {}} onSetKind={() => {}} onSetTargetDate={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: /pick a date/i }))
  expect(screen.getByLabelText('Pick a target date')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/MilestoneCard.test.jsx
```

Expected: the 3 new tests FAIL (no preset row / `onSetTargetDate` not wired); pre-existing tests still PASS.

- [ ] **Step 3: Add the preset row to `MilestoneCard.jsx`**

In `src/components/MilestoneCard.jsx`:

(a) Update the imports and props. Change line 1-2 and the function signature:

```jsx
import { useState } from 'react'
import { presetDate, formatSoftDate } from '../utils/milestoneStatus'
import styles from './MilestoneCard.module.css'

const EFFORT_CHIPS = ['Write 400 words', 'Read for 30 min', 'Practice 20 min', 'Draft one section']

const PRESETS = [['week', 'This week'], ['fortnight', '2 weeks'], ['month', '1 month']]

export default function MilestoneCard({ milestone, expanded, onToggle, onRename, onAddAction, onRemoveAction, onSetKind, onSetTargetDate }) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
```

(b) Add the date row inside the `body` div, immediately AFTER the `{showCustom && (...)}` form block and BEFORE the closing `</div>` of `styles.body`:

```jsx
          <div className={styles.dateRow}>
            <p className={styles.dateLabel}>Hope to finish by · optional</p>
            <div className={styles.datePresets}>
              {PRESETS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={styles.datePreset}
                  onClick={() => { onSetTargetDate(presetDate(key)); setShowPicker(false) }}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className={styles.datePreset}
                onClick={() => setShowPicker(true)}
              >
                Pick a date
              </button>
            </div>
            {showPicker && (
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Pick a target date"
                value={milestone.targetDate || ''}
                onChange={e => onSetTargetDate(e.target.value || null)}
              />
            )}
            {milestone.targetDate && (
              <p className={styles.dateChosen}>Hope to finish {formatSoftDate(milestone.targetDate)}</p>
            )}
          </div>
```

- [ ] **Step 4: Add the preset-row styles to `MilestoneCard.module.css`**

Append to the end of `src/components/MilestoneCard.module.css`:

```css
.dateRow {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-lavender-line);
}

.dateLabel {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.datePresets {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.datePreset {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1.5px solid var(--color-lavender-line);
  background: var(--color-white);
  color: var(--color-purple);
  cursor: pointer;
}

.dateInput {
  margin-top: var(--space-3);
  padding: 9px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  border: 1.5px solid var(--color-lavender-line);
  border-radius: 12px;
  outline: none;
}

.dateChosen {
  margin-top: var(--space-3);
  font-size: 12.5px;
  color: var(--color-body-gray);
}
```

- [ ] **Step 5: Thread `onSetTargetDate` and seed new milestones in `GoalActions.jsx`**

In `src/screens/GoalActions.jsx`:

(a) Add a `setTargetDate` handler next to the other milestone handlers (e.g. after `setKind`):

```jsx
  function setTargetDate(milestoneId, iso) {
    updateMilestone(milestoneId, m => ({ ...m, targetDate: iso }))
  }
```

(b) Seed new milestones with the two fields — update `addMilestone`:

```jsx
// Before
    setMilestones(prev => [...prev, { id, name: '', actions: [] }])
// After
    setMilestones(prev => [...prev, { id, name: '', actions: [], targetDate: null, reached: false }])
```

(c) Pass the callback to `MilestoneCard` — add the prop alongside the existing ones in the `.map`:

```jsx
            onSetKind={(actionId, kind) => setKind(milestone.id, actionId, kind)}
            onSetTargetDate={iso => setTargetDate(milestone.id, iso)}
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run src/components/MilestoneCard.test.jsx src/screens/GoalActions.test.jsx
```

Expected: all tests PASS (new MilestoneCard tests + all pre-existing in both files).

- [ ] **Step 7: Commit**

```bash
git add src/components/MilestoneCard.jsx src/components/MilestoneCard.module.css src/screens/GoalActions.jsx src/components/MilestoneCard.test.jsx
git commit -m "feat: add optional target-date presets to the milestone editor"
```

---

### Task 4: Home status chips + reached toggle (`ReturnView.jsx` + CSS)

Show each milestone's soft date + status chip, collapse reached milestones to a quiet line, and add a "Reached it ✓" toggle.

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Modify: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add these tests to the end of `src/screens/ReturnView.test.jsx`. (The file already imports `screen`, `userEvent`, `renderWithApp`, `ReturnView`. Use fixed far-past/far-future dates so status is deterministic regardless of the real clock.)

```jsx
const datedSeed = {
  goalName: 'Pass IFN637',
  supporters: [],
  milestones: [
    { id: 'm1', name: 'On-track milestone', targetDate: '2099-12-31', reached: false,
      actions: [{ id: 'a1', label: 'Read 2 papers', source: 'effort', kind: 'repeat', count: 0 }] },
    { id: 'm2', name: 'Slipped milestone', targetDate: '2000-01-01', reached: false,
      actions: [{ id: 'a2', label: 'Run analysis', source: 'effort', kind: 'repeat', count: 0 }] },
  ],
}

test('renders an On track chip for a far-future milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText('● On track')).toBeInTheDocument()
})

test('renders a Slipped chip for a past milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText('○ Slipped')).toBeInTheDocument()
})

test('"Reached it" collapses a milestone to the reached line', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  const reachButtons = screen.getAllByRole('button', { name: /reached it/i })
  await userEvent.click(reachButtons[0])
  expect(screen.getByText('On-track milestone', { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/✓ Reached/)).toBeInTheDocument()
  // the on-track milestone's action is now hidden
  expect(screen.queryByText('Read 2 papers')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: the 3 new tests FAIL (no chips, no reached collapse); pre-existing tests still PASS.

- [ ] **Step 3: Add imports and status metadata to `ReturnView.jsx`**

At the top of `src/screens/ReturnView.jsx`, add the import and a status map (place the import after the `CompleteControl` import, the map after the imports):

```jsx
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import { milestoneStatus, formatSoftDate } from '../utils/milestoneStatus'
import PrimaryButton from '../components/PrimaryButton'
import { ROLES } from '../data/roles'
import styles from './ReturnView.module.css'

const STATUS_META = {
  ontrack: { cls: 'chipOntrack', label: '● On track' },
  duesoon: { cls: 'chipDuesoon', label: '◐ Due soon' },
  slipped: { cls: 'chipSlipped', label: '○ Slipped' },
}
```

- [ ] **Step 4: Add the `setReached` handler**

In `ReturnView.jsx`, add this next to `applyCount`:

```jsx
  function setReached(milestoneId, val) {
    const updated = milestones.map(m => (m.id === milestoneId ? { ...m, reached: val } : m))
    setMilestones(updated)
    updateState({ milestones: updated })
  }
```

- [ ] **Step 5: Replace the milestone `.map` body**

In `ReturnView.jsx`, replace the entire `{milestones.map((milestone, i) => { ... })}` block inside `<div className={styles.steps}>` with:

```jsx
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
            </div>
          )
        })}
```

- [ ] **Step 6: Add the styles to `ReturnView.module.css`**

Append to the end of `src/screens/ReturnView.module.css`:

```css
.stepRight {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stepDate {
  font-size: 11px;
  color: var(--color-muted);
}

.statusChip {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 9px;
  white-space: nowrap;
}

.chipOntrack { background: var(--color-progress-tint); color: var(--color-progress-green); }
.chipDuesoon { background: var(--color-coral-tint); color: var(--color-coral); }
.chipSlipped { background: var(--color-coral-tint); color: var(--color-coral); }

.reachLink {
  margin-top: var(--space-3);
  background: none;
  border: none;
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  padding: 0;
}

.reachedLine {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2) 0;
  font-family: var(--font-body);
}

.reachedChip {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 9px;
  background: var(--color-progress-tint);
  color: var(--color-progress-green);
}

.reachedName {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-muted);
  text-decoration: line-through;
}
```

- [ ] **Step 7: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: all tests PASS (3 new + all pre-existing).

- [ ] **Step 8: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: milestone status chips and Reached-it toggle on the home screen"
```

---

### Task 5: Slipped support prompt (`ReturnView.jsx` + CSS)

When a milestone has slipped, show a gentle prompt offering to move the date (inline presets) or let the huddle know (local confirmation).

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Modify: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add these tests to the end of `src/screens/ReturnView.test.jsx` (reuse the `datedSeed` defined in Task 4):

```jsx
test('a slipped milestone shows the support prompt and two actions', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText(/plans bend/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /move the date/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /let your huddle know/i })).toBeInTheDocument()
})

test('"Let your huddle know" shows a confirmation', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  await userEvent.click(screen.getByRole('button', { name: /let your huddle know/i }))
  expect(screen.getByText(/huddle.*told/i)).toBeInTheDocument()
})

test('"Move the date" reveals preset chips', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  await userEvent.click(screen.getByRole('button', { name: /move the date/i }))
  expect(screen.getByRole('button', { name: '1 month' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: the 3 new tests FAIL; pre-existing tests still PASS.

- [ ] **Step 3: Add local state, imports, and handlers to `ReturnView.jsx`**

(a) Add `presetDate` to the utility import:

```jsx
import { milestoneStatus, formatSoftDate, presetDate } from '../utils/milestoneStatus'
```

(b) Add `PRESETS` near `STATUS_META`:

```jsx
const PRESETS = [['week', 'This week'], ['fortnight', '2 weeks'], ['month', '1 month']]
```

(c) Add local state next to the existing `useState` calls in the component:

```jsx
  const [movingId, setMovingId] = useState(null)
  const [notifiedIds, setNotifiedIds] = useState([])
```

(d) Add a `moveDate` handler next to `setReached`:

```jsx
  function moveDate(milestoneId, iso) {
    const updated = milestones.map(m => (m.id === milestoneId ? { ...m, targetDate: iso } : m))
    setMilestones(updated)
    updateState({ milestones: updated })
    setMovingId(null)
  }
```

- [ ] **Step 4: Insert the slipped prompt into the milestone render**

In `ReturnView.jsx`, inside the non-reached `return (...)` block of the `.map`, add the prompt immediately AFTER the `<button ... className={styles.reachLink}>Reached it ✓</button>` and before the closing `</div>` of `stepGroup`:

```jsx
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
```

- [ ] **Step 5: Add the styles to `ReturnView.module.css`**

Append to the end of `src/screens/ReturnView.module.css`:

```css
.support {
  background: var(--color-coral-tint);
  border-radius: 12px;
  padding: 11px 12px;
  margin-top: var(--space-3);
}

.supportText {
  font-size: 12px;
  color: var(--color-coral);
  margin-bottom: var(--space-3);
  line-height: 1.4;
}

.supportTold {
  font-size: 12px;
  color: var(--color-coral);
  font-weight: 500;
}

.supportRow {
  display: flex;
  gap: var(--space-3);
}

.supportMove {
  font-family: var(--font-body);
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 10px;
  padding: 7px 12px;
  background: var(--color-white);
  color: var(--color-coral);
  border: 1px solid var(--color-coral);
  cursor: pointer;
}

.supportTell {
  font-family: var(--font-body);
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 10px;
  padding: 7px 12px;
  background: var(--color-coral);
  color: var(--color-white);
  border: none;
  cursor: pointer;
}

.movePresets {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.movePreset {
  font-family: var(--font-body);
  font-size: 11.5px;
  font-weight: 500;
  border-radius: 999px;
  padding: 7px 12px;
  background: var(--color-white);
  color: var(--color-coral);
  border: 1px solid var(--color-coral);
  cursor: pointer;
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: all tests PASS (3 new + Task 4's + pre-existing).

- [ ] **Step 7: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: gentle slipped-milestone support prompt on the home screen"
```

---

### Task 6: Role-differentiated supporter view (`SupportingCard.jsx`)

Replace the static "rough week" line with the date-derived `slipped` line — visible only on the Everything card.

**Files:**
- Modify: `src/components/SupportingCard.jsx`
- Modify: `src/components/SupportingCard.test.jsx`

- [ ] **Step 1: Update the tests**

In `src/components/SupportingCard.test.jsx`, make these changes:

(a) Update the `everything` fixture (line 5):

```jsx
// Before
const everything = { id: 'sg-1', name: 'Alex', role: 'all', goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true }
// After
const everything = { id: 'sg-1', name: 'Alex', role: 'all', goal: 'Run a half-marathon', progress: '3 of 5 runs this week', slipped: '"Long run" slipped past 20 May' }
```

(b) Replace the test at line 9 (`'Everything role shows goal, progress, struggle and both actions'`):

```jsx
test('Everything role shows goal, progress, the slipped line and both actions', () => {
  render(<SupportingCard person={everything} onAct={() => {}} />)
  expect(screen.getByText('Run a half-marathon')).toBeInTheDocument()
  expect(screen.getByText(/3 of 5 runs this week/)).toBeInTheDocument()
  expect(screen.getByText(/slipped past/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send encouragement/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
})
```

(c) Replace the test at line 38 (`'Everything role without struggleFlag hides the rough-week line'`):

```jsx
test('Everything role without a slipped milestone hides the slipped line', () => {
  const noSlip = { id: 'sg-9', name: 'Avery', role: 'all', goal: 'Learn piano', progress: '2 practices this week' }
  render(<SupportingCard person={noSlip} onAct={() => {}} />)
  expect(screen.queryByText(/slipped past/i)).not.toBeInTheDocument()
  expect(screen.getByText('Learn piano')).toBeInTheDocument()
})
```

(d) Add a new test confirming the Progress card never shows a slip, even if the data carries one:

```jsx
test('Progress role never shows a slipped line even if present in data', () => {
  const progressWithSlip = { id: 'sg-2', name: 'Sam', role: 'progress', win: 'Just finished chapter 2', slipped: '"X" slipped past 1 May' }
  render(<SupportingCard person={progressWithSlip} onAct={() => {}} />)
  expect(screen.queryByText(/slipped past/i)).not.toBeInTheDocument()
  expect(screen.getByText(/Just finished chapter 2/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/SupportingCard.test.jsx
```

Expected: FAIL — the component still renders `struggleFlag`/"rough week", not `slipped`.

- [ ] **Step 3: Update `SupportingCard.jsx`**

In `src/components/SupportingCard.jsx`, change the struggle line in the `role === 'all'` block (line 45):

```jsx
// Before
      {person.struggleFlag && <p className={styles.scStruggle}>○ Flagged a rough week</p>}
// After
      {person.slipped && <p className={styles.scStruggle}>○ {person.slipped}</p>}
```

No other changes — the `progress` and `availability` branches never render `slipped`, so the role gating is automatic.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/components/SupportingCard.test.jsx
```

Expected: all tests PASS.

- [ ] **Step 5: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: entire suite PASSES (all new tests + every pre-existing test).

- [ ] **Step 6: Commit**

```bash
git add src/components/SupportingCard.jsx src/components/SupportingCard.test.jsx
git commit -m "feat: supporter Everything card shows date-derived slipped line"
```

---

### Final verification (manual, after Task 6)

- [ ] Run `npm run dev` at 390px. In onboarding, set a milestone's date via presets + "Pick a date". On the home screen, confirm On track / Due soon / Slipped chips, the "Reached it ✓" collapse, and the slipped support prompt (Move the date reveals presets; Let your huddle know shows the confirmation).
- [ ] On the Supporting tab, confirm the Everything card shows the slipped line, the Progress card shows only the win, and the Availability card is unchanged.
