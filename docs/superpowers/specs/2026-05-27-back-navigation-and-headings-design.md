# Back Navigation + Keyword-Forward Headings

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** `AppContext`, new `BackButton` component, `GoalSetup`, `GoalActions`, `Cadence`, `OfferedSocial`, `Recognition` (+ tests); heading copy on the first four screens

---

## 1. Context — why this change

The onboarding is forward-only (`goTo`); only `GoalActions` has a bespoke "← Edit goal". Users can't step back to review/adjust earlier answers. This adds consistent **back navigation** across the flow and, while we're touching every screen's top, makes each **heading more keyword-indicative** of what the page is for.

## 2. Back navigation

### 2.1 Mechanism — history stack in `AppContext`
- Add `history` state (array of screen ids).
- `goTo(screenId)`: push the current screen onto `history`, then fade-navigate (unchanged 150ms).
- Add `goBack()`: if `history` is non-empty, pop the last entry and fade-navigate to it (do NOT push).
- Expose `goBack` and `canGoBack` (`history.length > 0`) from context.
- Rationale: history returns the user to **wherever they came from**, which correctly handles the Home-base **re-offer** loop (Home base → Supporters → back → Home base). A fixed linear order would mishandle that.

### 2.2 Scope
Back appears on **GoalActions, Cadence, OfferedSocial, Recognition**. NOT on **GoalSetup** (first screen) or **ReturnView** (terminal home base). The Home-base re-offer button is unchanged.

### 2.3 Edit preservation — commit on back
Each back-enabled screen commits its current working state before navigating (the same fields its forward action writes), so navigating back to review/edit and forward again loses nothing:
- **GoalActions:** `updateState({ milestones })` — **unpruned** (don't drop an in-progress empty milestone; pruning stays only on Next).
- **Cadence:** `updateState({ cadence, cadenceDays })`.
- **OfferedSocial:** `updateState({ supporters })`.
- **Recognition:** completions are already written to state on each tap, so back just calls `goBack()` (no extra commit).

Each screen wires a `handleBack` = (commit) + `goBack()`.

### 2.4 UI — shared `BackButton`
- New presentational component `src/components/BackButton.jsx` (+ `.module.css`): a small top-left **"← Back"** link (purple, subtle), `aria-label="Go back"`, takes an `onClick`.
- Rendered at the top of each back-enabled screen, wired to that screen's `handleBack`.
- **Replaces** GoalActions' current "← Edit goal" link with this consistent control.
- Always rendered on the four screens (they always have history in the real flow); GoalSetup and ReturnView simply don't include it.

## 3. Keyword-forward headings

Update the main heading on the first four screens so the page's purpose is explicit. Keep the warm tone.

| Screen | Current heading | New heading |
|---|---|---|
| GoalSetup | "What are you working toward?" | **"What goal are you working on?"** |
| GoalActions | *(goal name as h1)* | **"Break it into milestones"** as the h1, with the goal name shown as a small context eyebrow line above it (so the page reads as the *milestones* step while still showing the goal). The existing "Break it into milestones" section label is removed (now the h1). |
| Cadence | "How often feels realistic?" | **"How often can you work on this?"** |
| OfferedSocial | "Want someone in your corner?" | **"Want a supporter in your corner?"** |

**Unchanged:** Recognition ("You're set up. Try it once.") and ReturnView ("Welcome back." + goal name) — already purpose-clear and not in the user's keyword list.

## 4. Data flow / impl notes

- `GoalActions` top becomes: `BackButton` → eyebrow (goal name, small/gray) → h1 "Break it into milestones" → Bandura science note → helper → milestone accordion → "+ Add milestone" → Next. (The `.back`/`.goalHeading` styles are replaced by the shared BackButton + a new `.eyebrow`; the milestones h1 reuses the heading style.)
- Other screens: insert `<BackButton onClick={handleBack} />` as the first child of the `screenPad` container, above the headline.
- `goTo`/`goBack` keep the existing fade; `BackButton` clicks route through `handleBack` per screen.

## 5. Testing

- **AppContext:** `goTo` pushes history; `goBack` returns to the previous screen after 150ms and is a no-op when history is empty; `canGoBack` reflects history.
- **BackButton:** renders "← Back" / `aria-label` "Go back"; calls `onClick`.
- **Each of the 4 screens:** a Back control is present (assert the "Go back" button renders); clicking it does not throw. GoalActions: the "Edit goal" assertion becomes the generic Back; the goal name still shows; "Break it into milestones" still present (now the h1).
- **Headings:** update the heading assertions in `GoalSetup.test`, `App.test` (load), `Cadence.test`, `OfferedSocial.test` to the new copy. GoalActions.test keeps asserting "Break it into milestones" (now h1) and the goal name (eyebrow).
- ReturnView / Recognition heading tests unchanged.

## 6. Files touched

- Modify: `src/context/AppContext.jsx` + `.test.jsx`
- Create: `src/components/BackButton.jsx` + `.module.css` + `.test.jsx`
- Modify: `src/screens/GoalSetup.jsx` + `.test.jsx` (heading); `src/App.test.jsx` (load heading)
- Modify: `src/screens/GoalActions.jsx` + `.module.css` + `.test.jsx` (BackButton, eyebrow + h1)
- Modify: `src/screens/Cadence.jsx` + `.test.jsx` (BackButton, heading)
- Modify: `src/screens/OfferedSocial.jsx` + `.test.jsx` (BackButton, heading)
- Modify: `src/screens/Recognition.jsx` + `.test.jsx` (BackButton)

## 7. Out of scope

- No browser-history / URL integration (in-memory only, consistent with the prototype).
- No back on the Home base; no change to the re-offer button itself.
- Repeated-vs-one-off action modeling (still the separately-tracked future topic).
