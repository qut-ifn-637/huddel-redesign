# Two-Page Goal Flow + Reintroduced Milestones

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** new `GoalSetup` screen, `GoalActions` (becomes the breakdown page), `StepCard`→`MilestoneCard`, `AppContext`, `App.jsx`, `Cadence`, `Recognition`, `ReturnView`, `global.css`, and `specs/00_README.md` (thesis reframe)
**Supersedes:** the "Steps" naming and the anti-milestone thesis from the two prior specs (`2026-05-27-goal-steps-breakdown-design.md`, `2026-05-27-welcome-cut-and-step-headline-design.md`). The 3-tier structure and effort-first framing are retained; only the middle-layer name and the thesis change.

---

## 1. Context — why this change

The goal step currently does two jobs on one screen (name the goal + break it down) and names the middle layer "Steps" to avoid the word "milestone". The user has decided — with the research below — to:
1. **Split the goal step into two pages:** (1) set a good goal, (2) break it into the middle layer → effort actions.
2. **Reintroduce "Milestones"** as the middle-layer name, with **effort-based actions as an integral part** of each milestone.
3. **Reframe the A2 thesis** so milestones are no longer "the problem" but the research-backed proximal-sub-goal layer, with effort actions as the recognized unit of progress beneath them.

**Intended outcome:** a research-grounded goal flow — meaningful goal → proximal milestones → effort actions — with subtle on-screen science notes that make the reasoning legible (and double as evidence of research grounding for the marker).

## 2. Reframed A2 thesis (edits `specs/00_README.md`)

The user explicitly asked to reframe the thesis. Update `specs/00_README.md`:

**One-sentence spine (replace):**
> Huddel's original onboarding set outcome-based milestones with no controllable effort layer and no schedule flexibility, so this cohort — students juggling work and study — stalled when a week blew up. This redesign keeps **proximal milestones** (Bandura & Schunk 1981 — they drive momentum and self-efficacy) but nests **effort-based actions** beneath them as the recognized unit of progress (Pham & Taylor 1999), at a user-chosen cadence — so effort counts even when outcomes slip.

**Rule #1 (replace "milestone never appears"):**
> A milestone is never a bare outcome deadline — it is always paired with effort-based actions underneath it, and progress is recognized at the effort-action level. Use "milestone" for the proximal sub-goal layer and "action" for the controllable effort beneath it.

Update the demo-readiness checklist item "'Milestone' appears nowhere" accordingly (remove / invert).

## 3. Research basis (for the write-up + on-screen notes)

All citations verified against sources. Honest caveats included.

- **SMART is a practitioner heuristic, NOT validated science** (Swann et al. 2022, *Health Psychology Review*: "not based on scientific theory"). Doran's 1981 original was Specific/Measurable/**Assignable**/**Realistic**/Time-related. → do not present SMART as proven; use light nudges only.
- **Goal-setting theory** (Locke & Latham 2002, *American Psychologist*): specific + slightly challenging + committed goals beat "do your best"; needs commitment + feedback.
- **Goal quality:** approach beats avoidance framing (Elliot, Sheldon & Church 1997); self-concordant/meaningful goals sustain effort (Sheldon & Elliot 1999); for novel/low-skill work, learning goals beat pure outcome goals (Seijts & Latham 2005).
- **Proximal milestones:** Bandura & Schunk (1981, *JPSP*) — proximal sub-goals drove mastery, self-efficacy, intrinsic interest; distal goals showed "no demonstrable effect." **"Milestone" is project-management vocabulary, not a research construct — the literature says "proximal sub-goals."** Note this in the report.
- **Effort/process > outcome framing:** Pham & Taylor (1999, *PSPB*) — simulating the *process* boosted study time and grades; outcome simulation did not.

## 4. Decisions (locked with the user)

| Decision | Choice |
|---|---|
| Middle-layer name | **"Milestones"** (UI), nesting effort actions; internal state field renamed `steps` → `milestones` |
| Structure | 3-tier: meaningful goal → proximal milestones → effort-based actions |
| Page split | Page 1 set the goal; Page 2 break into milestones → actions |
| Page 1 scaffolding | **Light nudge** — specificity/ownership helper, no rigid SMART fields |
| Science notes | Subtle, cited microcopy on Page 1, Page 2, Cadence, Recognition, ReturnView; **omitted on OfferedSocial** (no verified social-support citation — do not invent one) |
| Thesis | Reframed (Section 2); edits `specs/00_README.md` |
| Guard tests | The 6 `does not contain the word milestone` tests removed; "milestone" is now intended copy |

## 5. Page 1 — `GoalSetup` (new screen)

- Carries the `Huddel` brand mark + value-prop subhead "Huddel plans around real life — so your goals bend when your week does." (these MOVE here from GoalActions).
- Headline: **"What are you working toward?"**
- Goal input, placeholder **"e.g. Pass IFN637"**, helper: **"Be specific and make it yours — 'Pass IFN637', not 'do better'."**
- Science note (subtle, see §8): *"Specific, meaningful goals are pursued harder. — Locke & Latham, 2002"*
- Initializes the input from `state.goalName` (so navigating back preserves it).
- `Continue` (PrimaryButton, disabled until goal name non-empty) → `updateState({ goalName })`, `goTo('goal-actions')`.
- New screen id: `'goal'`. It is the app's entry screen.

## 6. Page 2 — `GoalActions` becomes the breakdown page

- **Loses** the goal input and brand/subhead (moved to GoalSetup).
- Shows the goal name as a read-only context heading at the top, with a **back affordance** (`← {goalName}` or a back button) that `goTo('goal')`.
- Section label: **"Break it into milestones"**; helper unchanged in spirit (optional, add as many as help).
- Science note near the section: *"Near-term milestones build momentum and confidence. — Bandura & Schunk, 1981"*
- Accordion of **MilestoneCards** (renamed from StepCard). Inside the MilestoneCard, just under the "Add an effort-based action" label, a note: *"Describe what you'll do, not the finish line. — Pham & Taylor, 1999"*. Because the accordion opens one milestone at a time, this shows in the currently-expanded card only (never repeated across cards on screen at once).
- `Next` (gate: ≥1 action across all milestones) → `updateState({ goalName, milestones })` (prune empty milestones), `goTo('cadence')`.

## 7. Rename: Steps → Milestones (pervasive)

- `AppContext` default: `milestones: [{ id: 'milestone-1', name: '', actions: [] }]`; `allActions(milestones)` (same flatten logic, param renamed). `currentScreen` initial → `'goal'`.
- `StepCard.jsx`/`.module.css`/`.test.jsx` → **`MilestoneCard.*`** (rename via `git mv`); placeholder **"Name this milestone — e.g. Research"**, aria-label **"Milestone name"**; otherwise the same name-headline + caret + effort-actions component.
- `App.jsx`: add `'goal'` → `GoalSetup` to SCREENS; `'goal-actions'` stays → `GoalActions` (breakdown).
- `Recognition`: reads `state.milestones`; first incomplete action across milestones; label is the owning **milestone** name when set.
- `ReturnView`: groups actions under **milestone** headers (`milestone.name.trim() || \`Milestone N\``); single unnamed milestone renders flat.

## 8. Science-note microcopy (shared treatment)

- Add a shared utility class `.scienceNote` to `src/styles/global.css`: small (12–13px), `--color-body-gray`, italic, with a little top margin — subtle, never competing with primary content.
- Placement:
  - **Page 1 (GoalSetup):** under the goal input — Locke & Latham note.
  - **Page 2 (GoalActions):** under the "Break it into milestones" label — Bandura & Schunk note (milestones build momentum). The Pham & Taylor (effort/process) note lives *inside* MilestoneCard (§6), so it shows in the open card — do NOT also place it at the section level.
  - **Cadence:** one line (below); **Recognition:** after the peak message; **ReturnView:** near the progress line.
  - One note per location — never stack multiple citations in one spot.
- **Cadence** note (defensible application of commitment principle): *"A cadence you'll actually keep protects commitment. — Locke & Latham, 2002"*.
- **Recognition** note: *"Finishing one small action builds the confidence that drives the next. — Bandura & Schunk, 1981"*.
- **ReturnView** note: *"Seeing near-term progress sustains motivation. — Bandura & Schunk, 1981"*.
- **OfferedSocial:** no science note (no verified citation; do not fabricate).

## 9. Navigation / state

- Entry screen `'goal'`. Flow: `goal` → `goal-actions` → `cadence` → `offered-social` → `recognition` → `return-view`. Re-offer from ReturnView still routes to `offered-social`.
- `GoalSetup` writes `goalName`; `GoalActions` writes `goalName` (carry-through) + `milestones`. Both via `updateState`.

## 10. Testing

- **New:** `GoalSetup.test.jsx` — renders brand/headline/subhead, goal input + helper, science note present, Continue disabled until goal name entered.
- **MilestoneCard.test.jsx** (renamed from StepCard.test) — same behaviors with "milestone" placeholder/aria-label.
- **GoalActions.test.jsx** — no goal input now; shows goal name + back; "Break it into milestones" present; milestone editable; add-milestone; Next gating; science note present.
- **AppContext.test.jsx** — default has `milestones` (one empty); `currentScreen` starts `'goal'`; `allActions` flattens milestones.
- **App.test.jsx** — loads the goal page (brand + headline).
- **Cadence / Recognition / ReturnView tests** — seed `milestones` instead of `steps`; assert the science notes render.
- **Remove** all `does not contain the word milestone` guard tests. Optionally assert "milestone" copy is present on the breakdown page.

## 11. Out of scope

- The "why does this matter" intrinsic-goal field (considered, not chosen — light nudge only).
- Reordering milestones; deadlines; SMART structured fields.
- Any change to OfferedSocial beyond leaving it as-is (no science note).

## 12. Files touched

- New: `src/screens/GoalSetup.jsx` + `.module.css` + `.test.jsx`
- Rename: `src/components/StepCard.*` → `src/components/MilestoneCard.*`
- Modify: `src/App.jsx`, `src/App.test.jsx`, `src/context/AppContext.jsx`, `src/context/AppContext.test.jsx`, `src/screens/GoalActions.jsx` + `.module.css` + `.test.jsx`, `src/screens/Cadence.jsx` + `.test.jsx`, `src/screens/Recognition.jsx` + `.test.jsx`, `src/screens/ReturnView.jsx` + `.test.jsx`, `src/styles/global.css`, `specs/00_README.md`
