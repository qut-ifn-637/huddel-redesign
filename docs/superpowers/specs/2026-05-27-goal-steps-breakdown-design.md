# Screen 02 Redesign — Step-Based Goal Breakdown

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** Screen 02 (GoalActions), Screen 05 (Recognition), Screen 06 (ReturnView), `AppContext`
**Supersedes (in part):** `specs/02_goal_and_actions.md` — see §6 for the deliberate departures.

---

## 1. Context — why this change

The current Screen 02 lets the user name a goal and add a flat list of effort-based actions. In use, a single flat list flattens the structure of larger goals ("Finish my essay" is really research → draft → polish, each with its own actions). Goal-setting research shows that decomposing a distal goal into **proximal sub-goals** is what drives follow-through and self-efficacy (Bandura & Schunk 1981; Locke & Latham 2002/2006). We want to add an intermediate grouping layer so users can break a broad goal into ordered chunks, then attach effort-actions to each.

The obvious word for that layer — "milestone" — is banned project-wide. The entire redesign exists *because* outcome-based "milestones" failed this cohort (the one-sentence spine in `specs/00_README.md`; non-negotiable rule #1; a participant who couldn't parse the word "milestone"). So this design keeps the decomposition benefit while **reframing the layer as effort-oriented "Steps"** — extending the effort thesis rather than reversing it.

**Intended outcome:** a user can optionally break a goal into named "Steps", attach effort-actions under each, and see that structure pay off on the Recognition and Return-view screens — without any forced decomposition and without the word "milestone".

## 2. Research basis (for A2 traceability / ethics-band citation)

- **Goal decomposition into proximal sub-goals** improves performance; failures on complex goals often trace to *deficient* decomposition (Locke & Latham 2002/2006; Seijts & Latham 2001). Granularity is task-dependent — three levels should not be forced on simple goals.
- **Proximal vs distal:** Bandura & Schunk (1981) — proximal sub-goals produced the fastest progress, mastery, and self-efficacy; distal-only goals showed "no demonstrable effects." → surface the *next* step, not just the far goal.
- **Effort > outcome framing:** Pham & Taylor (1999) — process/effort simulation produced more study effort and higher scores than outcome simulation. → keep concrete actions effort-based.
- **Implementation intentions** (Gollwitzer & Sheeran 2006, d≈.65) — attaching when/where to an action boosts completion. *Noted as a future enhancement, out of scope here (§9).*
- **Over-decomposition risk:** Soman & Cheema (2004) — violating fine-grained goals can leave people worse off than no goal. → keep structure optional and low-friction.
- **"Milestone" comprehension:** no published study tests the word itself; this rests on the team's own A2 participant data plus plain-language guidance (prefer concrete everyday words). Represent it that way in the report.

## 3. Decisions (locked with the user)

| Decision | Choice |
|---|---|
| Intermediate layer name | **"Steps"** (effort/progress-framed; step *names* may carry outcome shape) |
| Introduction | **Optional & progressive** — never a required wall |
| Layout | **Accordion step cards** — exactly one expanded at a time |
| Action framing | **Effort-only** — the "By outcome" action tab is removed |
| Endowed progress | **No pre-seeded action**; effort suggestion chips retained as lighter scaffolding |
| On load | **One empty, unnamed, expanded step** |
| Propagation | **Full** — steps carry through screens 02, 05, 06 |
| Banned word | "milestone" still never appears |

## 4. Data model (`AppContext`)

`steps[]` becomes the single source of truth, replacing the flat `actions[]`:

```js
{
  context: null,
  goalName: '',
  steps: [
    // { id, name, actions: [ { id, label, source: 'effort' | 'custom', completed } ] }
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
}
```

- **Default:** `steps: [{ id: 'step-1', name: '', actions: [] }]` — one empty step, no pre-seeded action.
- Action `source` drops `'outcome'`; only `'effort'` (added from a suggestion chip) and `'custom'` (user-typed) remain.
- Provide a selector helper `allActions(steps) => steps.flatMap(s => s.actions)` for screens needing a flat view.
- `updateState` / `goTo` semantics unchanged.

## 5. Screen 02 — GoalActions (rewrite)

**Layout (top → bottom):** Gelica headline `What are you working toward?` → goal input (placeholder `e.g. Finish my essay`) → section label `Break it into steps` (helper notes it's optional) → accordion of step cards → `+ Add step` → `Next`.

**Step card — expanded:**
- Editable name field, placeholder `Name this step (optional)`.
- Effort action list — each action a Beige card with a remove (×) control.
- Effort suggestion chips: `Write 400 words` · `Read for 30 min` · `Practice 20 min` · `Draft one section` · `+ Write my own` (inline custom field). **No tabs, no outcome chips.**

**Step card — collapsed:** shows name (or `Step N` when unnamed) + action count; tapping expands it and collapses the others.

**`+ Add step`:** appends a new empty step and expands it.

**`Next`:** enabled when `goalName` is non-empty **and** ≥1 action exists across all steps. On advance, **prune any step with zero actions** so downstream screens never render empty groups.

**Component:** extract a `StepCard` component for the card UI and action editing. The single-open accordion state is owned by `GoalActions` (which step is expanded); `StepCard` receives `expanded` + `onToggle` props. Reuse the existing inline custom-input pattern.

## 6. Deliberate departures from `specs/02_goal_and_actions.md`

Documented so the change is defensible, not accidental:
1. **No pre-seeded worked example** — removes the endowed-progress nudge the original spec mandated. Suggestion chips remain as lighter scaffolding. (Updates the demo-readiness checklist item "one worked-example action pre-seeded".)
2. **No "By outcome" action tab** — the original spec kept it as a present-but-secondary tab. It is removed; the step layer now carries outcome/chunk shape. This strengthens the effort thesis (Pham & Taylor) rather than flipping it.

Everything else in the original spec (effort-first framing, calm recognition, "milestone" ban, thumb-reachable primary action, tokens) is preserved.

## 7. Downstream propagation

**Recognition (05) — "try it once":**
- Pick the **first incomplete action across all steps** (`allActions(steps).find(a => !a.completed)`, falling back to the first action). This is the proximal "next" target.
- If that action's step is **named**, show a subtle `Step 1 · Research` label above the CompleteControl. Otherwise omit it.
- Completion handler marks that action `completed` within its step. Cadence-based continue copy unchanged.

**Return view (06) — home base:**
- **Group actions under their step**, each group with a header `Step N · Name` and a per-step count (e.g. `Research — 2/3`).
- CompleteControl per action (unchanged behaviour); overall progress copy unchanged.
- **Single unnamed step → render flat** (no headers), exactly like today. Headers appear only when there are ≥2 steps or any step is named — simple goals pay no structure tax.

## 8. Testing

- **AppContext:** new state shape; default = one empty step with no actions; `allActions` helper; `updateState` merge still works.
- **GoalActions:** headline verbatim; no outcome tab present; one empty expanded step on load; tapping a suggestion chip adds an effort action to the open step; `+ Add step` adds & expands; `Next` disabled until goal name + ≥1 action; empty steps pruned on advance; `milestone` absent.
- **Recognition:** seeds `steps`; renders first incomplete action; shows step label only when the step is named; cadence copy branches; `milestone` absent.
- **ReturnView:** grouped rendering with per-step counts; single-unnamed-step renders flat; completed action shown ticked; supporter line / re-offer unchanged; `milestone` absent.
- All existing `milestone`-guard tests remain and must pass ("steps" is not "milestone").

## 9. Out of scope

- Implementation intentions (when/where per action) — strong future enhancement, not this iteration.
- Auto-suggesting a step breakdown from the goal name.
- Reordering steps via drag-and-drop (manual add/remove only).
- Deadlines/scheduling (Cadence is the next screen).

## 10. Files touched

- `src/context/AppContext.jsx` (+ test)
- `src/screens/GoalActions.jsx` + `.module.css` (+ test) — major
- `src/components/StepCard.jsx` + `.module.css` (+ test) — new
- `src/screens/Recognition.jsx` (+ test) — moderate
- `src/screens/ReturnView.jsx` + `.module.css` (+ test) — moderate
