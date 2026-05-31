# Adapt Plan from ReturnView Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users navigate from ReturnView back to the GoalActions editor to add milestones or actions mid-goal, then return directly to ReturnView on save.

**Architecture:** A `returnTo` field (default `null`) added to AppContext `defaultState` acts as a one-shot navigation flag. ReturnView sets it to `'return-view'` before navigating to GoalActions. GoalActions reads it to conditionally relabel its primary button ("Save changes" vs "Next") and route back to ReturnView instead of Cadence. The flag is cleared when GoalActions saves. All three changes are contained — no new screens, no new components.

**Tech Stack:** React 18, Vitest, Testing Library (`renderWithApp` from `src/test/helpers.jsx`)

---

### Task 1: Add `returnTo` to AppContext and update GoalActions

Wire up the `returnTo` flag in state and make GoalActions respond to it with a changed label and route.

**Files:**
- Modify: `src/context/AppContext.jsx`
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add to `src/screens/GoalActions.test.jsx`:

```jsx
test('shows "Next" button by default (no returnTo set)', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByRole('button', { name: /^next$/i })).toBeInTheDocument()
})

test('shows "Save changes" button when returnTo is return-view', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: { ...seed, returnTo: 'return-view' } })
  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
})
```

Note: `seed` is already defined at the top of the test file as `const seed = { goalName: 'Finish my essay' }`.

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: `'shows "Save changes" button when returnTo is return-view'` FAILS — `returnTo` is not in state and the button still says "Next". The `'shows "Next" button by default'` test may pass (the button already exists) but run both to confirm.

- [ ] **Step 3: Add `returnTo: null` to AppContext defaultState**

In `src/context/AppContext.jsx`, find `const defaultState = {` and add `returnTo: null` after `supporters: []`:

```js
const defaultState = {
  goalName: '',
  milestones: [
    { id: 'milestone-1', name: '', actions: [] },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
  returnTo: null,
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

- [ ] **Step 4: Update `handleNext` and the primary button in GoalActions.jsx**

In `src/screens/GoalActions.jsx`, replace the existing `handleNext` function:

```jsx
function handleNext() {
  const pruned = milestones.filter(m => m.actions.length > 0)
  if (state.returnTo === 'return-view') {
    updateState({ milestones: pruned, returnTo: null })
    goTo('return-view')
  } else {
    updateState({ milestones: pruned })
    goTo('cadence')
  }
}
```

And update the `PrimaryButton` at the bottom of the `return` block to use a conditional label:

```jsx
<PrimaryButton onClick={handleNext} disabled={!canAdvance}>
  {state.returnTo === 'return-view' ? 'Save changes' : 'Next'}
</PrimaryButton>
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: all tests PASS (including both new ones and all 12 pre-existing)

- [ ] **Step 6: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: all 142 tests PASS (140 pre-existing + 2 new GoalActions tests)

- [ ] **Step 7: Commit**

```bash
git add src/context/AppContext.jsx src/screens/GoalActions.jsx src/screens/GoalActions.test.jsx
git commit -m "feat: add returnTo flag so GoalActions can route back to ReturnView"
```

---

### Task 2: Add "+ Adapt my plan" button to ReturnView

Add the entry point in ReturnView that sets the `returnTo` flag and navigates to GoalActions.

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Modify: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Write the failing test**

Add to `src/screens/ReturnView.test.jsx`:

```jsx
test('shows an "Adapt my plan" button', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByRole('button', { name: /adapt my plan/i })).toBeInTheDocument()
})
```

Note: `baseState` is already defined at the top of the test file.

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: FAIL — `Unable to find an accessible element with the role "button" and name "Adapt my plan"`

- [ ] **Step 3: Add the button to ReturnView.jsx**

In `src/screens/ReturnView.jsx`, add the "+ Adapt my plan" button immediately after the closing `</div>` of `<div className={styles.steps}>` and before the supporters block. The full updated section looks like this:

```jsx
      </div>

      <button
        type="button"
        className={styles.adaptBtn}
        onClick={() => {
          updateState({ returnTo: 'return-view' })
          goTo('goal-actions')
        }}
      >
        + Adapt my plan
      </button>

      {supporters.length > 0 ? (
```

- [ ] **Step 4: Add the `.adaptBtn` CSS class to ReturnView.module.css**

Append to the end of `src/screens/ReturnView.module.css`:

```css
.adaptBtn {
  background: none;
  border: none;
  color: var(--color-body-gray);
  font-family: var(--font-body);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: var(--space-5);
  display: block;
}
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: all tests PASS (15 total — 14 pre-existing + 1 new)

- [ ] **Step 6: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: all 143 tests PASS (140 pre-existing + 2 new GoalActions tests from Task 1 + 1 new ReturnView test)

- [ ] **Step 7: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: add Adapt my plan button to ReturnView"
```
