# Adapt Plan from ReturnView — Design Spec

**Date:** 2026-05-31
**Improvement:** #3 from usability test findings (Medium severity)
**File:** `docs/design-improvements.md` — "Goal structure — enforced sequential ordering"
**Affects:** `src/context/AppContext.jsx`, `src/screens/ReturnView.jsx`, `src/screens/GoalActions.jsx`

---

## Problem

The usability test participant wanted to adapt their plan as circumstances change — adding new milestones or actions after a goal is already in progress — rather than having to know everything upfront at setup time.

> "The situation might change a lot… I wouldn't have thought of that. Whereas like the original Huddel, I would have to think of everything that I need to get done beforehand." (01:38, 16:58)

The current prototype has no affordance for modifying milestones or actions from the ReturnView (home base) screen. Once the setup flow is complete, the plan is locked.

**Note:** Any-order completion is already supported — all actions render as independent `CompleteControl` cards in ReturnView with no sequential locking. The missing capability is plan adaptability after setup.

---

## Decision

**Add a "+ Adapt my plan" button to ReturnView that navigates to the existing GoalActions editor, then returns directly to ReturnView on save.**

A `returnTo` flag in AppContext acts as a one-shot navigation signal. When GoalActions detects `returnTo === 'return-view'`, it relabels its primary button to "Save changes" and routes back to ReturnView instead of Cadence. No new screens, no new components — the existing GoalActions editor handles everything.

Rejected alternatives:
- **Inline form in ReturnView** — duplicates the milestone/action editor already in GoalActions; unnecessary for a prototype
- **Back-button-only approach** — leaves "Next" routing to Cadence, which is confusing for a user who just wanted to add an action mid-goal

---

## Design

### AppContext (`src/context/AppContext.jsx`)

Add `returnTo: null` to `defaultState`:

```js
const defaultState = {
  goalName: '',
  milestones: [...],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
  returnTo: null,   // ← add this
  supporting: [...],
  encouragements: {...},
}
```

No other changes to AppContext. `returnTo` is set by ReturnView and cleared by GoalActions.

### ReturnView (`src/screens/ReturnView.jsx`)

Add a text-style "+ Adapt my plan" button below the milestone list and above the supporters block:

```jsx
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
```

**Visual treatment:** matches the existing `.reOffer` button (text-only, Body Gray, no fill, no border) — a secondary affordance that doesn't compete with the primary "Mark today's action done" button.

Append to `ReturnView.module.css` (after existing classes):
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

### GoalActions (`src/screens/GoalActions.jsx`)

Read `state.returnTo` in `handleNext` and conditionally change the route and button label:

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

Primary button label — conditional on `returnTo`:
```jsx
<PrimaryButton onClick={handleNext} disabled={!canAdvance}>
  {state.returnTo === 'return-view' ? 'Save changes' : 'Next'}
</PrimaryButton>
```

No other changes to GoalActions. The Back button, milestone editor, helper text, example card, and `canAdvance` guard are all unchanged.

---

## Scope

**In scope:**
- `src/context/AppContext.jsx` — add `returnTo: null` to defaultState
- `src/screens/ReturnView.jsx` — add "+ Adapt my plan" button and handler
- `src/screens/ReturnView.module.css` — add `.adaptBtn` style
- `src/screens/GoalActions.jsx` — conditional route and button label in `handleNext`

**Out of scope:**
- No changes to GoalActions CSS, MilestoneCard, or any other component
- No "Ordered" toggle (free-order completion already works)
- No ability to edit the goal name, cadence, or supporters from ReturnView
