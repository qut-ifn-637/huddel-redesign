# Recognition: Show All Actions + Skip

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** `src/screens/Recognition.jsx` + `.module.css` + `.test.jsx`
**Builds on:** the milestones model (`2026-05-27-two-page-goal-flow-and-milestones-design.md`)

---

## 1. Context — why this change

The Recognition screen ("You're set up. Try it once.") currently surfaces only the **first incomplete action** and offers **no way to skip** — the user must complete that one action to proceed. That feels constraining: the user can't see the rest of what they set up, and can't move on without engaging. This change shows **all** added actions and adds an always-available **skip**, while preserving the calm "try it once" recognition moment.

## 2. Decisions (locked with the user)

| Decision | Choice |
|---|---|
| Which actions | Show **all** added actions, grouped under their milestone (same treatment as the Return view) |
| Skip | **"Skip for now"** always visible at the bottom → routes to `return-view` |
| Skip vs continue | Skip always available; the primary continue **unlocks after completing any action** (preserves the "try it once" recognition) |
| Repeated vs one-off actions | **Out of scope here** — deferred to a separate design (noted in §6) |

## 3. Behavior

- Headline unchanged: **"You're set up. Try it once."**
- Render all actions grouped by milestone: a header showing `milestone.name.trim() || \`Milestone ${i+1}\`` is shown only when there is more than one milestone OR any milestone is named (identical rule to the Return view). A single unnamed milestone renders flat (no header). Each action is a tappable `CompleteControl`.
- Helper line (reworded for multiple actions): **"Tap one to mark it done — this is the move you'll come back for."**
- **Completing any action** (`completedAny` becomes true on the first completion):
  - marks that action `completed` in state (immutable nested map over milestones + `updateState({ milestones })`),
  - shows the calm peak message once: **"That's one done. This is how progress adds up."**,
  - shows the science note once: *"Finishing one small action builds the confidence that drives the next. — Bandura & Schunk, 1981"*,
  - after 1500ms, reveals the primary continue button.
- **Continue label** (unchanged, cadence-aware): `state.cadence === 'when_i_can'` → "See your home base →", else "See what tomorrow looks like →". Routes to `return-view`.
- **"Skip for now"** (SkipButton) is always visible and also routes to `return-view`. After a completion, both the primary continue and skip are present (continue is the rewarded CTA; skip the quiet escape).

## 4. Layout

```
You're set up. Try it once.        (headline)

[ Research ]                        (milestone header — only if named/>1)
  ◯ Write 400 words                 (CompleteControl, tappable)
  ◯ Read for 30 min
[ Draft ]
  ◯ Outline the intro

Tap one to mark it done — …         (helper)

That's one done. …                  (peak — after first completion)
Finishing one small action … 1981   (science note — after first completion)

bottomActions (fixed, thumb-reachable):
  [ See what tomorrow looks like → ] (primary — appears 1.5s after first completion)
  [ Skip for now ]                   (always)
```

## 5. Implementation

- Local state mirrors the Return view: `const [milestones, setMilestones] = useState(state.milestones)`; plus `const [completedAny, setCompletedAny] = useState(false)` and `const [showContinue, setShowContinue] = useState(false)`.
- `handleComplete(actionId)`: immutably set that action's `completed: true` across milestones, `setMilestones(updated)` + `updateState({ milestones: updated })`; if `!completedAny`, `setCompletedAny(true)` and `setTimeout(() => setShowContinue(true), 1500)`.
- `showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())` (same as Return view).
- Drop the old single-action "frozen target" (`targetId`) logic and the single milestone-label paragraph.
- Reuse `CompleteControl`, `SkipButton`, `PrimaryButton`. Bottom actions use the global `.bottomActions` container (thumb-reachable). The peak message + science note keep the existing calm fade-in styling; `.scienceNote` is the global utility class.

## 6. Out of scope (deferred)

Repeated-vs-one-off action modeling. Today every action is a single permanent `completed` tick and cadence is goal-level; the model does not distinguish actions you repeat ("Write 400 words") from one-off actions ("Submit the final draft"). This is a known gap (in tension with the recurring-effort thesis) and will be addressed in a separate design. **Do not build it in this change.**

## 7. Testing

- Headline renders.
- All added actions render (seed multiple milestones/actions; assert each label present).
- Grouped headers shown when a milestone is named / there are multiple; single unnamed milestone renders flat (no header).
- "Skip for now" is always present and routes to `return-view` (no crash on click; it calls goTo).
- Before any completion: no peak message, no science note, no primary continue button.
- Completing an action: peak message + science note appear immediately; after advancing timers 1500ms, the cadence-aware continue button appears (default and `when_i_can` variants).
- The milestone-guard test is not reintroduced (milestone copy is intended).

## 8. Files touched

- Modify: `src/screens/Recognition.jsx`, `src/screens/Recognition.module.css`, `src/screens/Recognition.test.jsx`
