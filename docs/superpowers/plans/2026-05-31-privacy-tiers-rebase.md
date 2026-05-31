# Privacy Tiers Re-base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-base the three supporter privacy tiers onto a single coherent "how much they see" ladder — **Everything** (goal + progress + slipped → check in), **Progress** (goal + wins → cheer), **Goal only** (just the goal, no action) — replacing the unrealistic "Just availability / I'm busy" floor.

**Architecture:** The tier model lives in one source of truth, `src/data/roles.js`. Task 1 re-bases the definitions (and updates the tests that read them directly). Task 2 updates `SupportingCard` rendering — a new `goal`-role branch replaces the `availability` branch, and the `progress` branch gains the goal name. Task 3 updates the demo `supporting` data so the three cards render coherently. No new screens; OfferedSocial and MyHuddleView read labels/copy from `roles.js` and need no JS change.

**Tech Stack:** React 18, Vite, CSS Modules, Vitest + Testing Library (globals enabled). Design reference: `docs/onboarding-screens.md` (the "Privacy tiers (re-based)" section).

**Out of scope:** no new "description at selection" block in MyHuddleView's add-flow (chips/`sees` labels there update automatically from `roles.js`); no CSS changes (the new `goal` branch reuses existing classes; the now-unused `.scQuiet`/`.scSpaceLine`/`.scNameMuted` classes are left in place).

---

### Task 1: Re-base the role definitions

Change the lowest tier from `availability` to `goal`, sharpen all three descriptions to their real capabilities, and update the tests that read `roles.js` directly.

**Files:**
- Modify: `src/data/roles.js`
- Modify: `src/data/roles.test.js`
- Modify: `src/screens/OfferedSocial.test.jsx`

- [ ] **Step 1: Update the tests (they now fail)**

In `src/data/roles.test.js`, replace the value-order test and the shareLabel test:

```js
// Replace the 'exposes the three supporter roles in order' test body:
test('exposes the three supporter roles in order', () => {
  expect(ROLES.map(r => r.value)).toEqual(['all', 'progress', 'goal'])
})

// Replace the 'every role has a supporter-side shareLabel' expected map:
test('every role has a supporter-side shareLabel', () => {
  const expected = { all: 'shares everything', progress: 'shares progress', goal: 'goal only' }
  for (const role of ROLES) {
    expect(role.shareLabel).toBe(expected[role.value])
  }
})
```
(The other two tests in the file — "Progress is the recommended role" and "every role has a label, description, sees" — are unchanged and must keep passing.)

In `src/screens/OfferedSocial.test.jsx`, make two changes:

```js
// Test 'Progress is selected by default (its description shows on load)' — update the matched phrase:
// Before
  expect(screen.getByText(/not the struggles/i)).toBeInTheDocument()
// After
  expect(screen.getByText(/never the hard days/i)).toBeInTheDocument()
```

```js
// Test 'role chips: all three options render' — update the third label:
// Before
  expect(screen.getByText('Just availability')).toBeInTheDocument()
// After
  expect(screen.getByText('Goal only')).toBeInTheDocument()
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/data/roles.test.js src/screens/OfferedSocial.test.jsx
```

Expected: FAIL — `roles.js` still has `availability`, the old shareLabel, and the old descriptions.

- [ ] **Step 3: Re-base `src/data/roles.js`**

Replace the entire file contents with:

```js
export const ROLES = [
  { value: 'all',      label: 'Everything', description: 'Sees your goal, your progress, and the hard days — and can check in. Best for a partner or close friend.', sees: 'sees everything — your progress and the hard days', shareLabel: 'shares everything' },
  { value: 'progress', label: 'Progress',   description: 'Sees your goal and your wins, never the hard days — and can cheer you on. Best for friends or family.',  sees: 'sees your goal and your wins', recommended: true, shareLabel: 'shares progress' },
  { value: 'goal',     label: 'Goal only',  description: "Sees only the goal you're working on — not your progress or the hard days. Best for someone you've told, to keep you honest.", sees: 'sees just your goal', shareLabel: 'goal only' },
]
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/data/roles.test.js src/screens/OfferedSocial.test.jsx
```

Expected: all tests PASS (the `roles.test.js` four + all `OfferedSocial.test.jsx`).

- [ ] **Step 5: Commit**

```bash
git add src/data/roles.js src/data/roles.test.js src/screens/OfferedSocial.test.jsx
git commit -m "feat: re-base supporter tiers — replace availability with goal-only"
```

---

### Task 2: Update SupportingCard rendering

Replace the `availability` branch with a `goal`-only branch (shows the goal, no action), and make the `progress` branch show the goal above the win.

**Files:**
- Modify: `src/components/SupportingCard.jsx`
- Modify: `src/components/SupportingCard.test.jsx`

- [ ] **Step 1: Update the tests**

In `src/components/SupportingCard.test.jsx`:

(a) Replace the `progress` fixture (line 6) and the `availability` fixture (line 7):

```jsx
// Before
const progress   = { id: 'sg-2', name: 'Sam',  role: 'progress', win: 'Just finished chapter 2' }
const availability = { id: 'sg-3', name: 'Jordan', role: 'availability', status: 'Busy this week' }
// After
const progress = { id: 'sg-2', name: 'Sam', role: 'progress', goal: 'Write her thesis', win: 'Just finished chapter 2' }
const goalOnly = { id: 'sg-3', name: 'Jordan', role: 'goal', goal: 'Learn Spanish' }
```

(b) Update the 'Progress role shows the win and only a cheer action' test to also assert the goal shows:

```jsx
test('Progress role shows the goal, the win, and only a cheer action', () => {
  render(<SupportingCard person={progress} onAct={() => {}} />)
  expect(screen.getByText('Write her thesis')).toBeInTheDocument()
  expect(screen.getByText(/Just finished chapter 2/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cheer this win/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
})
```

(c) Replace the 'Availability role shows the space line and NO action button' test (lines 25–29) with:

```jsx
test('Goal-only role shows the goal and NO action button', () => {
  render(<SupportingCard person={goalOnly} onAct={() => {}} />)
  expect(screen.getByText('Learn Spanish')).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
```

Leave the other tests (Everything+slipped, the onAct test, the two "slipped line" guards) unchanged.

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/SupportingCard.test.jsx
```

Expected: FAIL — `SupportingCard` still renders the `availability` "give them space" branch and the progress branch has no goal line.

- [ ] **Step 3: Update `src/components/SupportingCard.jsx`**

Replace the `if (person.role === 'availability') { ... }` block with:

```jsx
  if (person.role === 'goal') {
    return (
      <div className={styles.scCard}>
        <div className={styles.scTop}>
          <span className={styles.scName}>{person.name}</span>
          <span className={styles.scPillMuted}>{shareLabel}</span>
        </div>
        <p className={styles.scGoal}>{person.goal}</p>
        <p className={styles.scFootnote}>You see the goal, not the day-to-day — and that&apos;s the point.</p>
      </div>
    )
  }
```

And in the `if (person.role === 'progress') { ... }` block, add the goal line directly after the closing `</div>` of `scTop` and before the `scWin` paragraph:

```jsx
        {person.goal && <p className={styles.scGoal}>{person.goal}</p>}
        <p className={styles.scWin}>● {person.win}</p>
```

(The `role === 'all'` branch is unchanged.)

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/components/SupportingCard.test.jsx
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SupportingCard.jsx src/components/SupportingCard.test.jsx
git commit -m "feat: SupportingCard renders goal-only tier; Progress now shows the goal"
```

---

### Task 3: Update the demo supporting data

Make the three demo people render coherently under the new tiers: Sam (Progress) gains a goal; Jordan moves from `availability` to `goal`.

**Files:**
- Modify: `src/context/AppContext.jsx`
- Modify: `src/context/AppContext.test.jsx`

- [ ] **Step 1: Update the test**

In `src/context/AppContext.test.jsx`, update the role-order assertion in the 'default state seeds supporting and encouragements demo data' test:

```js
// Before
  expect(state.supporting.map(p => p.role)).toEqual(['all', 'progress', 'availability'])
// After
  expect(state.supporting.map(p => p.role)).toEqual(['all', 'progress', 'goal'])
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/context/AppContext.test.jsx
```

Expected: FAIL — the demo still has `'availability'` as the third role.

- [ ] **Step 3: Update the demo `supporting` data in `src/context/AppContext.jsx`**

Replace the `sg-2` (Sam) and `sg-3` (Jordan) entries:

```js
// Before
    { id: 'sg-2', name: 'Sam',    role: 'progress',      win: 'Just finished chapter 2' },
    { id: 'sg-3', name: 'Jordan', role: 'availability',  status: 'Busy this week' },
// After
    { id: 'sg-2', name: 'Sam',    role: 'progress', goal: 'Write her thesis', win: 'Just finished chapter 2' },
    { id: 'sg-3', name: 'Jordan', role: 'goal',     goal: 'Learn Spanish' },
```

(The `sg-1` Alex entry — `role: 'all'`, with `slipped` — is unchanged.)

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npx vitest run src/context/AppContext.test.jsx
```

Expected: PASS.

- [ ] **Step 5: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: entire suite PASSES — no remaining `availability` references, all tier tests green.

- [ ] **Step 6: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.jsx
git commit -m "feat: re-base demo supporters onto the goal-only tier"
```

---

### Final verification (manual, after Task 3)

- [ ] Run `npm run dev` at 390px. In onboarding (OfferedSocial) confirm the three tier chips read **Everything / Progress / Goal only** with the sharpened descriptions at selection. On the Supporting tab, confirm: Alex (Everything) shows goal + progress + slipped + check-in; Sam (Progress) shows goal + win + cheer; Jordan (Goal only) shows just the goal with no action button. In MyHuddleView, confirm the per-supporter "sees" lines and the add-flow chips reflect the new labels.
