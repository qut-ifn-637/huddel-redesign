# Repeat Button Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the "Repeats" / "Just once" segmented control labels in MilestoneCard to "Recurring" / "One-time" to eliminate usability confusion about what "Repeats" means.

**Architecture:** Two string changes in `MilestoneCard.jsx` and four corresponding test label references updated across `MilestoneCard.test.jsx` and `GoalActions.test.jsx`. No state, prop, CSS, or data shape changes. TDD order: update tests first (they fail), then update implementation (they pass).

**Tech Stack:** React 18, Vitest, Testing Library

---

### Task 1: Rename Repeats → Recurring and Just once → One-time

**Files:**
- Modify: `src/components/MilestoneCard.jsx`
- Modify: `src/components/MilestoneCard.test.jsx`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Update the four test label references (tests will now fail)**

In `src/components/MilestoneCard.test.jsx`, make these changes:

*Test `'the segmented control reflects a repeating action as selected'` (around line 92):*
```js
// Before
expect(screen.getByRole('button', { name: 'Repeats' })).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByRole('button', { name: 'Just once' })).toHaveAttribute('aria-pressed', 'false')
// After
expect(screen.getByRole('button', { name: 'Recurring' })).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByRole('button', { name: 'One-time' })).toHaveAttribute('aria-pressed', 'false')
```

*Test `'tapping "Just once" sets the action kind to once'` (around line 98) — rename test and update query:*
```js
// Before
test('tapping "Just once" sets the action kind to once', async () => {
  const onSetKind = vi.fn()
  renderCard({ milestone: filledMilestone, expanded: true, onSetKind })
  await userEvent.click(screen.getByRole('button', { name: 'Just once' }))
  expect(onSetKind).toHaveBeenCalledWith('a1', 'once')
})
// After
test('tapping "One-time" sets the action kind to once', async () => {
  const onSetKind = vi.fn()
  renderCard({ milestone: filledMilestone, expanded: true, onSetKind })
  await userEvent.click(screen.getByRole('button', { name: 'One-time' }))
  expect(onSetKind).toHaveBeenCalledWith('a1', 'once')
})
```

*Test `'tapping "Repeats" sets a one-off action back to repeat'` (around line 105) — rename test and update two queries:*
```js
// Before
test('tapping "Repeats" sets a one-off action back to repeat', async () => {
  const once = {
    ...filledMilestone,
    actions: [{ id: 'a1', label: 'Submit draft', source: 'effort', kind: 'once', count: 0 }],
  }
  const onSetKind = vi.fn()
  renderCard({ milestone: once, expanded: true, onSetKind })
  expect(screen.getByRole('button', { name: 'Just once' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Repeats' }))
  expect(onSetKind).toHaveBeenCalledWith('a1', 'repeat')
})
// After
test('tapping "Recurring" sets a one-off action back to repeat', async () => {
  const once = {
    ...filledMilestone,
    actions: [{ id: 'a1', label: 'Submit draft', source: 'effort', kind: 'once', count: 0 }],
  }
  const onSetKind = vi.fn()
  renderCard({ milestone: once, expanded: true, onSetKind })
  expect(screen.getByRole('button', { name: 'One-time' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Recurring' }))
  expect(onSetKind).toHaveBeenCalledWith('a1', 'repeat')
})
```

In `src/screens/GoalActions.test.jsx`, find the test `'a newly added action defaults to repeating'` and update its assertion:
```js
// Before
expect(screen.getByRole('button', { name: 'Repeats' })).toHaveAttribute('aria-pressed', 'true')
// After
expect(screen.getByRole('button', { name: 'Recurring' })).toHaveAttribute('aria-pressed', 'true')
```

- [ ] **Step 2: Run tests and confirm the four affected tests now fail**

```bash
npx vitest run src/components/MilestoneCard.test.jsx src/screens/GoalActions.test.jsx
```

Expected: 4 tests FAIL with `Unable to find an accessible element with the role "button" and name "Recurring"` (or similar). All other tests PASS.

- [ ] **Step 3: Update the button labels in MilestoneCard.jsx**

In `src/components/MilestoneCard.jsx`, find the segmented control (the two `<button>` elements inside the `role="group"` div) and change their text:

```jsx
// Before — first segment button (kind: 'repeat')
<button
  type="button"
  className={`${styles.segment} ${!isOnce ? styles.segmentActive : ''}`}
  aria-pressed={!isOnce}
  onClick={() => onSetKind(action.id, 'repeat')}
>
  Repeats
</button>
// After
<button
  type="button"
  className={`${styles.segment} ${!isOnce ? styles.segmentActive : ''}`}
  aria-pressed={!isOnce}
  onClick={() => onSetKind(action.id, 'repeat')}
>
  Recurring
</button>
```

```jsx
// Before — second segment button (kind: 'once')
<button
  type="button"
  className={`${styles.segment} ${isOnce ? styles.segmentActive : ''}`}
  aria-pressed={isOnce}
  onClick={() => onSetKind(action.id, 'once')}
>
  Just once
</button>
// After
<button
  type="button"
  className={`${styles.segment} ${isOnce ? styles.segmentActive : ''}`}
  aria-pressed={isOnce}
  onClick={() => onSetKind(action.id, 'once')}
>
  One-time
</button>
```

- [ ] **Step 4: Run tests and confirm all pass**

```bash
npx vitest run src/components/MilestoneCard.test.jsx src/screens/GoalActions.test.jsx
```

Expected: all tests PASS

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npm test
```

Expected: all 140 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/MilestoneCard.jsx src/components/MilestoneCard.test.jsx src/screens/GoalActions.test.jsx
git commit -m "fix: rename Repeats/Just once to Recurring/One-time for clarity"
```
