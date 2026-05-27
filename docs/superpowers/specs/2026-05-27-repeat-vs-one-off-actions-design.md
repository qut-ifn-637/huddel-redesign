# Repeated vs One-Off Actions

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** `CompleteControl`, `MilestoneCard`, `GoalActions`, `Recognition`, `ReturnView` (+ tests). `AppContext` default is unaffected (its seed milestone has no actions).

---

## 1. Context — why this change

Today every action is a single permanent `completed` boolean, and cadence is goal-level — so a recurring effort action ("Write 400 words") is modelled identically to a one-off ("Submit the draft"). That clashes with the recurring-effort thesis: you tick your action once and it's "done forever". This change distinguishes **repeating** from **one-off** actions, with a calm, reflective completion count and reversible (undoable) completion. (This is the topic deferred from the Recognition show-all design.)

## 2. Decisions (locked with the user)

| Decision | Choice |
|---|---|
| How type is set | Default **`repeat`**; a per-action **"Just once"** opt-out toggle |
| Repeat completion | A **gentle "done N×"** count (reflective, not a streak) |
| One-off completion | A reversible **toggle** (tick to complete, tap again to undo) |
| Undo | Yes — once toggles off via the circle; repeat decrements via a "−" |
| Representation | Replace the `completed` boolean with a `count` integer (`done` = `count > 0`) |

## 3. Data model

Each action becomes:
```js
{ id, label, source, kind: 'repeat' | 'once', count: 0 }
```
- `done` is **derived**: `count > 0`.
- New actions are created with `kind: 'repeat', count: 0` (in `GoalActions.addAction`).
- Helpers in the parents: `increment(actionId)` → `count + 1` for repeat, `1` for once; `decrement(actionId)` → `Math.max(0, count - 1)`.
- The `completed` boolean is removed everywhere (seeds, screens, tests). The on-screen tick is driven by `count > 0`.

## 4. `CompleteControl` (interface + behaviour)

New props: `{ actionId, label, count, repeatable, onComplete, onUndo }`.

- `done = count > 0` drives the green tick + `styles.completed` on the circle (the `data-testid="complete-circle"` element keeps its `completed` class when done, so existing tick assertions still hold).
- **Circle click / Enter / Space:**
  - `repeatable` (repeat): always calls `onComplete(actionId)` (i.e. +1).
  - non-`repeatable` (once): `count > 0 ? onUndo(actionId) : onComplete(actionId)` — a toggle.
- **Repeat tally + undo:** when `repeatable && count > 0`, show a muted **"done {count}×"** next to the label and a small **"−"** button (`aria-label="Undo one"`) that calls `onUndo(actionId)`. The "−" is a separate button; its click must not also trigger the circle.
- **Strikethrough:** only when **once** and done (a finished one-off). Repeat actions are never struck through (they recur).

## 5. Authoring — the "Just once" toggle (`MilestoneCard` + `GoalActions`)

- Each action row in the expanded `MilestoneCard` gains a small toggle showing **"Repeats"** (default) or **"Just once"**, tappable to switch. New prop `onToggleKind(actionId)`.
- `GoalActions`: `addAction` creates `{ id, label, source, kind: 'repeat', count: 0 }`; a `toggleKind(milestoneId, actionId)` flips the action's `kind` between `'repeat'` and `'once'`; passed to `MilestoneCard` as `onToggleKind`.

## 6. Home base (`ReturnView`)

- `handleComplete(actionId)` → increment; `handleUndo(actionId)` → decrement (immutable nested map over milestones + `updateState({ milestones })`).
- Each `CompleteControl` gets `count`, `repeatable = action.kind === 'repeat'`, `onComplete`, `onUndo`.
- Progress + per-milestone counts use **`count > 0`** for "done": `completedCount = flat.filter(a => a.count > 0).length`; `allDone = flat.length > 0 && completedCount === flat.length`; per-milestone `done = actions.filter(a => a.count > 0).length`. Progress copy unchanged.

## 7. Recognition

- Reuses the new `CompleteControl` (count/repeatable/onComplete/onUndo).
- `handleComplete` increments; `handleUndo` decrements.
- `completedAny` becomes "any action with `count > 0`", and **latches true on first completion** (an undo afterward does not retract the calm peak / continue — the recognition is a one-time warm moment).

## 8. Rule #2 guardrail (explicit)

The "done N×" tally is a **quiet reflective count only**: muted styling, **no streak language, no penalty for gaps, no comparison, no escalating reward, no badges/flames**. It recognises accumulated effort (on-thesis), not a score. Do not later evolve it into a streak/points mechanic.

## 9. Migration / ripple (`completed` → `count`)

Replace `completed` with `count` (and add `kind`) in: action creation (`GoalActions`), all test seeds across `Recognition.test`, `ReturnView.test`, and the `CompleteControl` tests in `components.test.jsx`. `done`/tick logic keys on `count > 0`. (`AppContext` default has no seeded action, so it's untouched.)

## 10. Testing

- **CompleteControl** (`components.test.jsx`): renders tick when `count > 0`; **once** toggles (click completes → onComplete; click again → onUndo); **repeat** click → onComplete; repeat with `count > 0` shows "done N×" and a "−" that calls onUndo; the "−" does not also fire onComplete; once+done shows strikethrough, repeat does not.
- **MilestoneCard**: an action row shows a "Repeats"/"Just once" toggle; clicking it calls `onToggleKind(actionId)`.
- **GoalActions**: tapping an effort chip creates an action with `kind: 'repeat', count: 0`; toggling it flips to `once`.
- **Recognition**: completing increments and reveals the peak; undo decrements; cadence-aware continue unchanged.
- **ReturnView**: a repeat action shows "done N×" after taps and a working "−"; a one-off ticks/untoggles; progress counts `count > 0`; the "completed circle" assertion seeds `count: 1`.

## 11. Files touched

- Modify: `src/components/CompleteControl.jsx` + `.module.css`; `src/components/components.test.jsx`
- Modify: `src/components/MilestoneCard.jsx` + `.module.css` + `.test.jsx`
- Modify: `src/screens/GoalActions.jsx` + `.test.jsx`
- Modify: `src/screens/Recognition.jsx` + `.test.jsx`
- Modify: `src/screens/ReturnView.jsx` + `.test.jsx`

## 12. Out of scope

- No real time/period reset (no "resets tomorrow" scheduling) — the count is a running reflective tally for the demo.
- No streaks/points/leaderboards (rule #2).
- No per-action cadence (cadence stays goal-level).
