# Supporter-Role Improvements (default Progress + respected nudge + home-base payoff)

**Date:** 2026-05-27
**Status:** Approved design, ready for implementation plan
**Affects:** new `src/data/roles.js`, `OfferedSocial`, `ReturnView`
**Builds on:** the supporter assessment (Spec 4 role-aware visibility) and the verified research briefing

---

## 1. Context — why this change

The supporter roles are defensible (A2 Spec 4 / Theme 2; restoring audience-calibrated disclosure vs context collapse — Petronio, Goffman, Marwick & boyd), but their value is **conditional** and, in the prototype, **under-demonstrated** — roles are configured but never pay off. This pass applies three research-backed improvements:
- **(a)** make **Progress** the recommended default (progress-only = the safe default: keeps accountability/observation benefit, minimises judgment/comparison).
- **(b)** a **respected-supporter nudge** (Klein et al. 2020 — sharing helps most with a higher-status/respected audience).
- **(c)** surface **what each supporter sees** + an opt-in **share** on the home base, so the feature is demonstrated, not just set up.

All sharing stays opt-in, effort/progress-framed, user-chosen, with no comparison mechanics (Self-Determination Theory autonomy; social-comparison risks).

## 2. Shared roles module (`src/data/roles.js`)

Single source of truth for supporter roles, imported by both screens (the set just changed — dropping "Just this goal" — so centralising prevents drift).

```js
export const ROLES = [
  { value: 'all',          label: 'Everything',        description: 'Sees this goal, your progress, and the hard days — e.g. a partner or close friend.', sees: 'sees everything — your progress and the hard days' },
  { value: 'progress',     label: 'Progress',          description: 'Sees your progress, not the struggles — e.g. an acquaintance.',                       sees: 'sees your progress', recommended: true },
  { value: 'availability', label: 'Just availability', description: "Sees that you're busy, not what you're working on — e.g. a manager or coworker.",     sees: "sees that you're busy" },
]
```

- `description` — the add-screen visibility line (note: Everything reworded from "your goals" → "this goal" for per-goal-scope consistency).
- `sees` — terse phrase for the home base.
- `recommended: true` on Progress drives the default + the "Recommended" tag.

## 3. (a) Progress as the recommended default — `OfferedSocial`

- Import `ROLES` from `../data/roles` (remove the inline `ROLES`).
- `selectedRole` initialises to `'progress'` (so its description shows on load and "Add" only needs a name).
- The Progress chip shows a small **"Recommended"** tag (driven by `role.recommended`). A `.recommendedTag` style; the tag text is inside the chip button (e.g., `Progress` + a small "Recommended" pill/superscript).

## 4. (b) Respected-supporter nudge — `OfferedSocial`

A subtle science note (global `.scienceNote` class) placed under the name input:
> *We follow through more for people we respect — pick someone whose cheer would land. — Klein et al., 2020*

## 5. (c) Home-base payoff — `ReturnView`

When `state.supporters.length > 0`, replace the single "{name} can cheer this on." line with a **"Your corner"** block:
- Heading: **Your corner**
- One row per supporter: `{name} — {sees}` where `sees` comes from the matching role in `ROLES` (fallback to the role value if not found).
- An opt-in **"Share this week's progress"** button. Local state `shared` (boolean); on click set `shared = true` and the button area shows a confirmed line: **"Shared — your corner can cheer you on ✓"** (no backend; purely a demonstrated interaction). Once shared, the button is replaced by the confirmation.

When `supporters.length === 0`, keep the existing soft re-offer button (→ `offered-social`) unchanged.

## 6. Out of scope

- No real notifications/sharing backend (the share is a local confirmed state).
- No leaderboards, ranking, or comparison between supporters (research: avoid).
- No change to the per-goal-vs-account-wide supporter model (still implicitly per-goal).
- No edit/remove of supporters on the home base.

## 7. Testing

- **roles.js:** exports 3 roles (`all`, `progress`, `availability`); Progress has `recommended: true`; each has a non-empty `sees`.
- **OfferedSocial:** imports shared ROLES; on load the Progress chip is selected (its description visible) and shows a "Recommended" tag; the Klein nudge text renders; the three role chips render; "Add" enables once a name is typed (role already defaulted); milestone-unrelated existing tests still pass.
- **ReturnView:** with one supporter, shows "Your corner", the `{name} — sees your progress` line, and a "Share this week's progress" control; clicking it shows the "Shared … ✓" confirmation; with no supporters, the re-offer button still shows; existing progress/grouping/greeting tests unchanged.

## 8. Files touched

- Create: `src/data/roles.js` + `src/data/roles.test.js`
- Modify: `src/screens/OfferedSocial.jsx` + `.module.css` + `.test.jsx`
- Modify: `src/screens/ReturnView.jsx` + `.module.css` + `.test.jsx`
