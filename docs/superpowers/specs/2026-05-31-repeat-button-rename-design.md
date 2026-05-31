# Repeat Button Rename — Design Spec

**Date:** 2026-05-31
**Improvement:** #2 from usability test findings (Medium severity)
**File:** `docs/design-improvements.md` — "'Repeat' button — ambiguous label"
**Affects:** `src/components/MilestoneCard.jsx`, `src/components/MilestoneCard.test.jsx`, `src/screens/GoalActions.test.jsx`

---

## Problem

Each action in MilestoneCard has a segmented control with two buttons: **"Repeats"** and **"Just once"**. During usability testing, the participant interpreted "Repeats" as doing the action multiple times within a single day, rather than its actual meaning — the action recurs across sessions (it reappears each time the user opens the app).

> "I thought it was like repeating the goal like more than once a day not repeating it actually like this." (09:25)

---

## Decision

**Rename the labels only. No new states or frequency options.**

- `Repeats` → `Recurring`
- `Just once` → `One-time`

"Recurring" is standard UX vocabulary that clearly implies something happening repeatedly over time — not multiple times right now. "One-time" is the natural, unambiguous opposite. Both terms are universally understood without requiring knowledge of how the app structures sessions.

The underlying `kind` values in AppContext (`'repeat'` / `'once'`) are unchanged. No state, prop, or data shape changes.

---

## Scope

**In scope:**
- `src/components/MilestoneCard.jsx` — two string changes (button text)
- `src/components/MilestoneCard.test.jsx` — update 4 label references across 3 tests
- `src/screens/GoalActions.test.jsx` — update 1 label reference

**Out of scope:**
- No changes to AppContext, state shape, or `kind` values
- No frequency options (Daily / Weekly / Custom)
- No icon additions
- No CSS changes

---

## Implementation notes

### `MilestoneCard.jsx` changes

Line 71 — button text:
```jsx
// Before
Repeats
// After
Recurring
```

Line 79 — button text:
```jsx
// Before
Just once
// After
One-time
```

### `MilestoneCard.test.jsx` changes

Three tests reference the old labels and must be updated:

**Test at line 92 — `'the segmented control reflects a repeating action as selected'`:**
```js
// Before
expect(screen.getByRole('button', { name: 'Repeats' })).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByRole('button', { name: 'Just once' })).toHaveAttribute('aria-pressed', 'false')
// After
expect(screen.getByRole('button', { name: 'Recurring' })).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByRole('button', { name: 'One-time' })).toHaveAttribute('aria-pressed', 'false')
```

**Test at line 98 — `'tapping "Just once" sets the action kind to once'`:**
```js
// Before (test name and query)
test('tapping "Just once" sets the action kind to once', async () => {
  ...
  await userEvent.click(screen.getByRole('button', { name: 'Just once' }))
// After
test('tapping "One-time" sets the action kind to once', async () => {
  ...
  await userEvent.click(screen.getByRole('button', { name: 'One-time' }))
```

**Test at line 105 — `'tapping "Repeats" sets a one-off action back to repeat'`:**
```js
// Before (test name and two queries)
test('tapping "Repeats" sets a one-off action back to repeat', async () => {
  ...
  expect(screen.getByRole('button', { name: 'Just once' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Repeats' }))
// After
test('tapping "Recurring" sets a one-off action back to repeat', async () => {
  ...
  expect(screen.getByRole('button', { name: 'One-time' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'Recurring' }))
```

### `GoalActions.test.jsx` changes

**Test `'a newly added action defaults to repeating'`:**
```js
// Before
expect(screen.getByRole('button', { name: 'Repeats' })).toHaveAttribute('aria-pressed', 'true')
// After
expect(screen.getByRole('button', { name: 'Recurring' })).toHaveAttribute('aria-pressed', 'true')
```
