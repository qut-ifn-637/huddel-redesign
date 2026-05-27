# Supporter-Role Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default the supporter role to Progress (recommended), add a respected-supporter nudge, and surface a "Your corner" payoff (what each supporter sees + an opt-in share) on the home base — backed by a shared roles module.

**Architecture:** Extract role definitions into `src/data/roles.js` (single source of truth). `OfferedSocial` imports it, pre-selects Progress, tags it "Recommended", and shows a cited nudge. `ReturnView` imports it to render a "Your corner" block with each supporter's `sees` phrase plus an opt-in "Share this week's progress" button that confirms locally.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react. `bottomActions`/`scienceNote` are global className strings.

Full design: `docs/superpowers/specs/2026-05-27-supporter-role-improvements-design.md`.

---

## File structure

```
src/data/roles.js              CREATE — shared ROLES (value, label, description, sees, recommended)
src/data/roles.test.js         CREATE
src/screens/OfferedSocial.jsx        MODIFY — import roles, default Progress, Recommended tag, nudge
src/screens/OfferedSocial.module.css MODIFY — .recommendedTag
src/screens/OfferedSocial.test.jsx   MODIFY
src/screens/ReturnView.jsx           MODIFY — "Your corner" block + share
src/screens/ReturnView.module.css    MODIFY — corner/share styles
src/screens/ReturnView.test.jsx      MODIFY
```

Task 1 is the foundation; 2 and 3 consume it. Each task leaves the suite green (Task 2 doesn't touch ReturnView, whose tests still pass against the old supporter line; Task 3 migrates it).

---

## Task 1: Shared roles module

**Files:** Create `src/data/roles.js`, `src/data/roles.test.js`

- [ ] **Step 1: Write `src/data/roles.test.js`**

```js
import { ROLES } from './roles'

test('exposes the three supporter roles in order', () => {
  expect(ROLES.map(r => r.value)).toEqual(['all', 'progress', 'availability'])
})

test('Progress is the recommended role', () => {
  const progress = ROLES.find(r => r.value === 'progress')
  expect(progress.recommended).toBe(true)
})

test('every role has a label, description, and a "sees" phrase', () => {
  for (const role of ROLES) {
    expect(role.label).toBeTruthy()
    expect(role.description).toBeTruthy()
    expect(role.sees).toBeTruthy()
  }
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- roles`
Expected: FAIL — `Cannot find module './roles'`.

- [ ] **Step 3: Create `src/data/roles.js`**

```js
export const ROLES = [
  { value: 'all',          label: 'Everything',        description: 'Sees this goal, your progress, and the hard days — e.g. a partner or close friend.', sees: 'sees everything — your progress and the hard days' },
  { value: 'progress',     label: 'Progress',          description: 'Sees your progress, not the struggles — e.g. an acquaintance.',                       sees: 'sees your progress', recommended: true },
  { value: 'availability', label: 'Just availability', description: "Sees that you're busy, not what you're working on — e.g. a manager or coworker.",     sees: "sees that you're busy" },
]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- roles`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/roles.js src/data/roles.test.js
git commit -m "feat: extract shared supporter roles module"
```

---

## Task 2: OfferedSocial — Progress default + Recommended tag + nudge

**Files:** Modify `src/screens/OfferedSocial.jsx`, `src/screens/OfferedSocial.module.css`, `src/screens/OfferedSocial.test.jsx`

- [ ] **Step 1: Rewrite `src/screens/OfferedSocial.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import OfferedSocial from './OfferedSocial'

test('renders headline verbatim', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Want a supporter in your corner?')).toBeInTheDocument()
})

test('renders a back control', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})

test('"Done — continue" button is always visible and enabled', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /done — continue/i })).not.toBeDisabled()
})

test('"Skip for now" button is always visible', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
})

test('skipping does not crash', async () => {
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByRole('button', { name: /skip for now/i }))
})

test('Progress is selected by default (its description shows on load)', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText(/not the struggles/i)).toBeInTheDocument()
})

test('the Progress chip shows a Recommended tag', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Recommended')).toBeInTheDocument()
})

test('renders the Klein respected-supporter nudge', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText(/Klein/)).toBeInTheDocument()
})

test('selecting a different role chip updates the visibility description', async () => {
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByText('Everything'))
  expect(screen.getByText(/partner or close friend/i)).toBeInTheDocument()
})

test('renders a header for the roles section', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('What will they see?')).toBeInTheDocument()
})

test('role chips: all three options render', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Everything')).toBeInTheDocument()
  expect(screen.getByText('Progress')).toBeInTheDocument()
  expect(screen.getByText('Just availability')).toBeInTheDocument()
  expect(screen.queryByText('Just this goal')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- OfferedSocial`
Expected: FAIL — no Recommended tag / Klein nudge yet; Progress isn't pre-selected.

- [ ] **Step 3: Replace `src/screens/OfferedSocial.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PrimaryButton from '../components/PrimaryButton'
import SkipButton from '../components/SkipButton'
import BackButton from '../components/BackButton'
import { ROLES } from '../data/roles'
import styles from './OfferedSocial.module.css'

export default function OfferedSocial() {
  const { state, updateState, goTo, goBack } = useApp()
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState('progress')
  const [supporters, setSupporters] = useState(state.supporters)

  function handleAdd() {
    if (name.trim() && selectedRole) {
      setSupporters(prev => [...prev, { name: name.trim(), role: selectedRole }])
      setName('')
      setSelectedRole('progress')
    }
  }

  function handleBack() {
    updateState({ supporters })
    goBack()
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
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>Want a supporter in your corner?</h1>
      <p className={styles.subhead}>
        Adding people is optional — and you choose exactly what they see. You can do this any time later.
      </p>

      <div className={styles.avatarGroup} aria-hidden="true">
        <div className={styles.avatar} style={{ background: '#c4b5fd' }}>A</div>
        <div className={styles.avatar} style={{ background: '#a5f3fc' }}>B</div>
        <div className={styles.avatar} style={{ background: '#bbf7d0' }}>C</div>
      </div>

      <div className={styles.addRow}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Name or contact"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <p className="scienceNote">We follow through more for people we respect — pick someone whose cheer would land. — Klein et al., 2020</p>

      <p className={styles.rolesHeader}>What will they see?</p>
      <div className={styles.roleChips}>
        {ROLES.map(role => (
          <button
            key={role.value}
            type="button"
            className={`${styles.roleChip} ${selectedRole === role.value ? styles.roleActive : ''}`}
            onClick={() => setSelectedRole(prev => (prev === role.value ? null : role.value))}
          >
            {role.label}
            {role.recommended && <span className={styles.recommendedTag}>Recommended</span>}
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

- [ ] **Step 4: Append `.recommendedTag` to `src/screens/OfferedSocial.module.css`**

Add this rule at the end of the file:

```css
.recommendedTag {
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-purple);
  background: var(--color-white);
  border-radius: 8px;
  padding: 1px 6px;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- OfferedSocial`
Expected: PASS — 11 tests.

- [ ] **Step 6: Run the full suite to verify green**

Run: `npm test`
Expected: all pass. (ReturnView still renders the old supporter line and its tests are unchanged — migrated in Task 3.)

- [ ] **Step 7: Commit**

```bash
git add src/screens/OfferedSocial.jsx src/screens/OfferedSocial.module.css src/screens/OfferedSocial.test.jsx
git commit -m "feat: default supporter role to Progress (recommended) + respected-supporter nudge"
```

---

## Task 3: ReturnView — "Your corner" payoff

**Files:** Modify `src/screens/ReturnView.jsx`, `src/screens/ReturnView.module.css`, `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Update `src/screens/ReturnView.test.jsx`**

Add `userEvent` to the imports (line 1 area):

```jsx
import userEvent from '@testing-library/user-event'
```

Replace the "shows supporter line by name when supporters is non-empty" test with these two:

```jsx
test('shows the "Your corner" block with what each supporter sees', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'progress' }] } })
  expect(screen.getByText('Your corner')).toBeInTheDocument()
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText(/sees your progress/i)).toBeInTheDocument()
})

test('the share button confirms after tapping', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'progress' }] } })
  await userEvent.click(screen.getByRole('button', { name: /share this week's progress/i }))
  expect(screen.getByText(/Shared — your corner can cheer you on/i)).toBeInTheDocument()
})
```

Leave the "shows soft re-offer when no supporters" test and all others unchanged.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- ReturnView`
Expected: FAIL — there's no "Your corner" block or share button yet.

- [ ] **Step 3: Replace `src/screens/ReturnView.jsx`**

```jsx
import { useState } from 'react'
import { useApp, allActions } from '../context/AppContext'
import CompleteControl from '../components/CompleteControl'
import PrimaryButton from '../components/PrimaryButton'
import { ROLES } from '../data/roles'
import styles from './ReturnView.module.css'

export default function ReturnView() {
  const { state, updateState, goTo } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [shared, setShared] = useState(false)

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
  const supporters = state.supporters

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
```

- [ ] **Step 4: Update `src/screens/ReturnView.module.css`**

Remove the `.supporterLine` rule and add the corner/share styles. The replaced section (everything from `.supporterLine` through `.reOffer:hover` stays except `.supporterLine` is swapped for the new rules):

Delete:

```css
.supporterLine {
  font-size: 14px;
  color: var(--color-body-gray);
  margin-bottom: var(--space-6);
}
```

Insert (before `.reOffer`):

```css
.corner {
  margin-bottom: var(--space-6);
}

.cornerHeader {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-purple);
  margin-bottom: var(--space-3);
}

.cornerList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.cornerItem {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  font-size: 14px;
}

.cornerName {
  font-weight: 600;
  color: var(--color-black);
}

.cornerSees {
  font-size: 13px;
  color: var(--color-body-gray);
  text-align: right;
}

.shareBtn {
  width: 100%;
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  background: var(--color-beige);
  color: var(--color-purple);
  border: 1.5px solid var(--color-purple);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: background 0.1s;
}

.shared {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-purple);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- ReturnView`
Expected: PASS — 11 tests.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: home-base 'Your corner' shows what supporters see + opt-in share"
```

---

## Task 4: End-to-end verification

No code unless a defect surfaces.

- [ ] **Step 1: Full suite** — Run: `npm test` → all files pass.
- [ ] **Step 2: Build** — Run: `npm run build` → no errors.
- [ ] **Step 3: Manual click-through (390px)** — On the supporter screen, Progress is pre-selected with a "Recommended" tag and the Klein nudge shows; add a supporter. On the home base, "Your corner" lists the supporter with what they see; "Share this week's progress" → "Shared … ✓". With no supporters, the re-offer still shows.
- [ ] **Step 4: Commit any fixes** (skip if none).

---

## Self-review notes

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §2 shared roles module (value/label/description/sees/recommended; Everything → "this goal") | Task 1 |
| §3 (a) Progress default + Recommended tag | Task 2 (selectedRole 'progress'; `.recommendedTag`) |
| §4 (b) Klein nudge | Task 2 (scienceNote line) |
| §5 (c) "Your corner" + per-supporter `sees` + opt-in share confirm | Task 3 |
| §6 out of scope (no backend/leaderboard) | share is local `shared` state only; no comparison UI |
| §7 testing | each task's tests |

**Type consistency:** `ROLES` shape `{ value, label, description, sees, recommended? }` defined in Task 1, consumed by OfferedSocial (label/description/recommended) and ReturnView (`sees`). Supporter object stays `{ name, role }`. `roleDescription`/`sees` lookups both key on `role`/`s.role`.

**Placeholder scan:** none — full code in every step.

**Green-between-tasks:** Task 1 additive. Task 2 touches only OfferedSocial (+ shared module already present); ReturnView still renders the old supporter line and its unchanged tests pass. Task 3 migrates ReturnView and its tests together.
