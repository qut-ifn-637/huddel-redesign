# Cut Welcome Screen + Step Name as Editable Headline

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** Welcome (deleted), `App.jsx`, `AppContext`, `GoalActions`, `StepCard`, `Cadence`
**Builds on:** `docs/superpowers/specs/2026-05-27-goal-steps-breakdown-design.md` (the steps feature this revises)

---

## 1. Context — why this change

Two usability findings after the steps feature shipped:

1. **The Welcome screen earns its keep for only one downstream effect.** Its question (`context` = work / study / both / life_full) is read in exactly one place — `Cadence.jsx`, where `context === 'both' || 'life_full'` shows a reassurance line. Everything else ignores it. For a flow optimised around effort-based planning, a whole screen + tap for one conditional sentence isn't worth it.
2. **The step name feels uneditable.** The rename handler works, but the name field is an "optional" input buried inside the expanded card while the prominent "Step 1" header is a collapse toggle — so users try to edit the wrong thing. Since each step is meant to be *the first breakdown of the goal*, the name should be the card's editable headline, not an afterthought.

**Intended outcome:** a leaner flow that starts on the goal screen, and a step card whose name is an obvious, first-class editable field.

## 2. Decisions (locked with the user)

| Decision | Choice |
|---|---|
| Welcome screen | **Removed**; framing folds into the goal screen |
| `context` state field | **Removed** (only Welcome wrote it; only Cadence read it) |
| Cadence reassurance trigger | Retriggered on **`cadence === 'when_i_can'`** (was context-based); copy unchanged. Scoped to `when_i_can` only — "irregular weeks" fits the most flexible cadence, not fixed "specific days". |
| Step card name | **Editable headline** (always-visible input) + a **separate caret** toggling the actions body |
| Step name required? | No — Next still gates on goal + ≥1 action; a single unnamed step still renders flat downstream. Prominence makes naming the natural default. |

## 3. Remove the Welcome screen

- **Delete:** `src/screens/Welcome.jsx`, `Welcome.module.css`, `Welcome.test.jsx`.
- **`src/App.jsx`:** remove the `Welcome` import and the `'welcome'` entry from the `SCREENS` map.
- **`src/context/AppContext.jsx`:** initial `currentScreen` becomes `'goal-actions'`; remove the `context: null` field from `defaultState`.
- **`src/App.test.jsx`:** the "on load" test now asserts the GoalActions headline (`What are you working toward?`) instead of the Welcome headline; the milestone-guard test stays.

## 4. Fold framing into the goal screen

GoalActions is now the first screen, so it carries brand + promise:
- A small `Huddel` brand mark at the top of the screen (styled like Welcome's brand line).
- A subhead under the headline: **"Huddel plans around real life — so your goals bend when your week does."**
- Headline unchanged: **"What are you working toward?"**.

## 5. Reframe StepCard — name as editable headline

**Header row (always visible, whether expanded or collapsed):**
- An editable text input is the headline, bound to `step.name` / `onRename` (placeholder **"Name this step — e.g. Research"**).
- A separate **caret button** to its right toggles the actions body. It calls `onToggle`, carries `aria-expanded={expanded}` and an aria-label (e.g. "Show actions" / "Hide actions").
- Tapping the input edits the name; tapping the caret expands/collapses. No overlap between the two affordances (this is the fix for the "can't edit" problem — the old single header-button captured the tap as a toggle).

**Body (only when expanded):** the existing action list (each removable) + the effort suggestion chips + "+ Write my own" inline input. Unchanged from the current StepCard.

**Accordion:** unchanged ownership — `GoalActions` still holds `expandedId` (single-open); `StepCard` receives `expanded` + `onToggle`.

**Downstream unaffected:** Recognition and ReturnView still derive a display label via `step.name.trim() || \`Step N\``; that fallback and the single-unnamed-step-flat behaviour are unchanged.

## 6. Cadence reassurance

`src/screens/Cadence.jsx`: replace `const showReassurance = state.context === 'both' || state.context === 'life_full'` with `const showReassurance = cadence === 'when_i_can'` — keyed off the **local** `cadence` state (`const [cadence, setCadence] = useState(state.cadence)`), NOT `state.cadence`. This is important: the local value updates as the user taps options, so the line appears/disappears live when "Whenever I can" is chosen/deselected. (`state.cadence` only updates on Next, so it would not react live.) Same reassurance copy and styling.

## 7. Testing

- **Delete** `Welcome.test.jsx`.
- **App.test.jsx:** load renders GoalActions headline; no "milestone".
- **AppContext.test.jsx:** default state no longer has `context`; `currentScreen` starts at `'goal-actions'`; steps default + `allActions` tests unchanged.
- **Cadence.test.jsx:** reassurance shows when `cadence: 'when_i_can'` is selected (drive via clicking the "Whenever I can" option or seeding `cadence`), and is absent otherwise; remove the old context-based reassurance tests.
- **StepCard.test.jsx:** name input is rendered and editing it calls `onRename`; the caret button calls `onToggle` (replaces the old "clicking the header" test); collapsed hides the body/chips while the name input stays visible; existing action-add/remove/custom tests unchanged; milestone guard stays.
- **GoalActions.test.jsx:** add/confirm the step name is directly editable (type into the name input, value reflects); existing tests (no outcome tab, Next gating, add step, nothing pre-filled, milestone) stay. May also assert the folded-in subhead text is present.

## 8. Traceability note (academic)

Removing Welcome drops the screen's mapping to **A2 Spec 7 / Theme 1** (cohort-fit / mobile framing) recorded in `specs/00_README.md`. This is a deliberate, user-approved trade favouring a leaner effort-planning flow. The "plans around real life" promise is preserved as the goal-screen subhead, retaining the flexibility-framing message if not the dedicated screen.

## 9. Out of scope

- No new tailoring logic from the (now-removed) context answer.
- No change to Recognition/ReturnView rendering beyond what the unchanged `step.name` fallback already does.
- No drag-reorder, no deadlines.

## 10. Files touched

- Delete: `src/screens/Welcome.jsx`, `Welcome.module.css`, `Welcome.test.jsx`
- Modify: `src/App.jsx`, `src/App.test.jsx`, `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`, `src/screens/GoalActions.jsx`, `src/screens/GoalActions.module.css`, `src/screens/GoalActions.test.jsx`, `src/components/StepCard.jsx`, `src/components/StepCard.module.css`, `src/components/StepCard.test.jsx`, `src/screens/Cadence.jsx`, `src/screens/Cadence.test.jsx`
