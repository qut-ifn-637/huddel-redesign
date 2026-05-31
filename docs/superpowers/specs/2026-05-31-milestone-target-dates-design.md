# Milestone Target Dates — Design Spec

**Date:** 2026-05-31
**Improvement:** Supporter-layer enabler (relates to usability findings #6/#8 — the social/role layer)
**Affects:** `src/context/AppContext.jsx`, `src/utils/milestoneStatus.js` (new), `src/components/MilestoneCard.jsx`, `src/screens/GoalActions.jsx`, `src/screens/ReturnView.jsx`, `src/components/SupportingCard.jsx`

---

## Problem

Supporters are assigned a visibility **role** — *Everything* ("sees your progress and the hard days"), *Progress* ("wins only"), *Availability* ("nothing"). But nothing in the app ever produces a "hard day": milestones are `{ id, name, actions }` with no notion of pace or a target, and "struggle" is a single static seed boolean (`struggleFlag`) rendered as "○ Flagged a rough week". With no way to fall behind, the *Everything* vs *Progress* distinction is hollow — the "Check in" affordance has nothing real to respond to.

> User: "For each milestone, we need to add a target completion date. Otherwise, the 'everything'/'progress' roles make no sense (there's no way to fail)."

## Decision

Add an **optional, soft "target completion date" per milestone**, plus an explicit **"reached"** state, and derive a gentle status from them. Slipping past a date becomes a **trigger for support, not a verdict of failure** — which gives the supporter roles a concrete, role-differentiated signal to act on.

**Thesis alignment:** the project is deliberately calm and non-pressure ("goals bend when your week does," no streaks/scores). The existing struggle copy ("*Flagged a rough week*") is already gentle and self-owned. This feature keeps that tone: dates are aspirational ("hope to finish by"), freely movable, optional; a slipped milestone routes to help ("move the date, or let your huddle know"), never to blame.

Chosen via brainstorming + visual companion:
- **Date hardness:** soft aspirational (rejected: firm deadline — too much pressure; no-date/cadence-only — doesn't give the concrete target requested).
- **Scope:** owner side **and** the demo supporter cards (rejected: owner-only — wouldn't actually *show* the roles working).
- **Milestone completion:** explicit "Reached it" toggle (rejected: auto-derive from actions — recurring actions never finish, so a milestone would never resolve; pure date-only — stays "slipped" forever after the work is done).
- **Date input:** quick relative presets with a "Pick a date" escape hatch (rejected: native-date-field-only — more calendar/deadline-like).

---

## Design

### 1. Data model (`src/context/AppContext.jsx`)

Each milestone gains two fields:

```js
{ id: 'milestone-1', name: '', actions: [], targetDate: null, reached: false }
```

- `targetDate`: ISO `'YYYY-MM-DD'` string, or `null` (no date set — the default; pressure-free).
- `reached`: boolean, default `false`.

Add these to the `defaultState` milestone seed. Any code that creates a milestone (`addMilestone` in `GoalActions.jsx`) must include `targetDate: null, reached: false`.

Demo `supporting` data: the `all`-role person (Alex) replaces `struggleFlag: true` with a seeded slipped descriptor:

```js
{ id: 'sg-1', name: 'Alex', role: 'all', goal: 'Run a half-marathon',
  progress: '3 of 5 runs this week', slipped: '"Long run" slipped past 20 May' }
```

Sam (`progress`) and Jordan (`availability`) are unchanged.

### 2. Status logic (`src/utils/milestoneStatus.js`, new)

A pure, dependency-free module with two exports:

```js
// today defaults to the real clock in the app; tests pass a fixed Date.
export function milestoneStatus(milestone, today = new Date()) {
  if (milestone.reached) return 'reached'
  if (!milestone.targetDate) return 'none'
  const target = new Date(milestone.targetDate + 'T00:00:00')
  const days = Math.ceil((target - startOfDay(today)) / 86400000)
  if (days < 0) return 'slipped'
  if (days <= 3) return 'duesoon'
  return 'ontrack'
}

// '2026-06-14' -> '~14 Jun'
export function formatSoftDate(iso) { ... }
```

- `'reached' | 'slipped' | 'duesoon' | 'ontrack' | 'none'`.
- `duesoon` threshold: **within 3 days** (inclusive), date not yet past.
- `startOfDay` normalises `today` so "due today" is `duesoon`, not `slipped`.
- `formatSoftDate` renders the `~DD Mon` soft form (the `~` signals "aspiration, not deadline").

### 3. Date presets

The preset chips compute an ISO date from "today":
- **This week** → today + 7 days
- **2 weeks** → today + 14 days
- **1 month** → today + 1 calendar month
- **Pick a date** → reveals a native `<input type="date">`; its value (already ISO) is stored directly.

Selecting a chip sets `targetDate`; the active chip highlights. The field is optional and re-settable (movable).

### 4. Milestone editor (`MilestoneCard.jsx` + CSS, `GoalActions.jsx`)

`MilestoneCard` (the editable accordion card, used both in onboarding and the "Adapt my plan" flow) gains a "Hope to finish by · optional" row beneath the actions, holding the four preset chips (+ the conditional native date input). A new callback is threaded through exactly like the existing milestone callbacks:

```
onSetTargetDate(milestoneId, isoDateOrNull)
```

`GoalActions.jsx` implements it (mutating its local `milestones` state, persisted on advance like the others) and passes it to each `MilestoneCard`. No other editor behaviour changes; `reached` is **not** set here (it lives on the home screen).

### 5. Home screen (`ReturnView.jsx` + CSS)

Per milestone group (the existing `stepGroup`):

- **Header** shows the soft date (`formatSoftDate(targetDate)`) + a status chip driven by `milestoneStatus(...)`:
  - `ontrack` → `● On track` (green), `duesoon` → `◐ Due soon` (coral), `slipped` → `○ Slipped` (coral). `none` → no chip/date.
- Each **unreached** group has a small **"Reached it ✓"** text link → sets that milestone's `reached: true`.
- **Reached** groups collapse to a single quiet line (`✓ Reached · <name>`) and do **not** render their action cards.
- **Slipped** groups render a gentle support prompt below the actions:
  > "This one slipped past your date. That's okay — plans bend."
  - **Move the date** → reveals the preset chips inline (local `ReturnView` state keyed by milestone id) to re-set `targetDate`.
  - **Let your huddle know** → flips the prompt to a calm confirmation line ("Your huddle's been told 💜"), tracked in local state. Prototype-only — no backend/notification.

Mutations (`reached`, moved `targetDate`) go through the existing AppContext update path `ReturnView` already uses for action counts.

### 6. Supporter view (`SupportingCard.jsx` + CSS)

The `all`-role card replaces the `struggleFlag` line with the date-derived `slipped` line in coral:

```jsx
{person.slipped && <p className={styles.scStruggle}>○ {person.slipped}</p>}
```

Send encouragement / Check in are unchanged. The `progress` card is unchanged (wins only — the slip is invisible to it). The `availability` card is unchanged. This renders the role-differentiated view that demonstrates the feature's purpose.

---

## Scope

**In scope:**
- `AppContext.jsx` — `targetDate`/`reached` milestone fields + `addMilestone` seed; demo Alex `slipped`.
- `src/utils/milestoneStatus.js` (new) — `milestoneStatus` + `formatSoftDate`.
- `MilestoneCard.jsx` (+CSS), `GoalActions.jsx` — preset row + `onSetTargetDate`.
- `ReturnView.jsx` (+CSS) — status chips, reached link + collapse, slipped support prompt (inline move-date, tell-huddle confirmation).
- `SupportingCard.jsx` (+CSS) — date-derived slipped line.

**Out of scope:**
- No overall-goal target date; no "coming up"/timeline view.
- No cadence-based "behind" signal (companion idea, deferred).
- No reminders or notifications; "Let your huddle know" is a local acknowledgement only, with no real messaging.
- No change to role definitions (`roles.js`).

---

## Testing

- **`milestoneStatus.js`** (the core guard) — unit tests for every branch with a fixed `today`: `reached` (regardless of date), `none` (no date), `slipped` (date in past), `duesoon` (within 3 days, incl. today), `ontrack` (further out). Plus `formatSoftDate('2026-06-14') === '~14 Jun'`.
- **AppContext** — default milestone includes `targetDate: null` and `reached: false`.
- **MilestoneCard / GoalActions** — the preset chips render; clicking "2 weeks" calls `onSetTargetDate` with an ISO date 14 days out; "Pick a date" reveals a `type="date"` input.
- **ReturnView** — renders the correct chip for a seeded milestone of each status; "Reached it" toggles a milestone to the collapsed reached line; a slipped milestone shows the support prompt; "Move the date" reveals the presets; "Let your huddle know" shows the confirmation.
- **SupportingCard** — the `all` card shows the `slipped` line; the `progress` card does **not** render it; the `availability` card is unchanged.
- Full Vitest suite stays green.
