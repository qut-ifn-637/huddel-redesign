# Guided Onboarding — Design Spec

**Date:** 2026-05-31
**Improvement:** #4 from usability test findings (Medium severity)
**File:** `docs/design-improvements.md` — "Onboarding flow — not guided or conversational enough"
**Affects:** `src/components/OnboardingProgress.jsx` (new), `src/screens/GoalSetup.jsx`, `src/screens/GoalActions.jsx`, `src/screens/Cadence.jsx`, `src/screens/OfferedSocial.jsx`, `src/screens/Recognition.jsx`

---

## Problem

The usability test participant found the onboarding stood as a series of disconnected forms. Each screen has a heading and a science note, but nothing connects one step to the next, acknowledges what the user just did, or shows how far along they are. The flow works, but it does not *feel* guided or conversational — and an onboarding that feels like filling in forms is easy to abandon.

The structure is already a wizard (five screens):

1. **GoalSetup** — goal name
2. **GoalActions** — milestones + actions
3. **Cadence** — frequency
4. **OfferedSocial** — supporters (skippable)
5. **Recognition** — try completing one action → enter the app

What it lacks is connective tissue: a consistent voice, affirmation of progress, and a visible sense that the end is near.

---

## Decision

**Make the existing flow feel guided — without adding screens, a chat UI, or a persona character.** Two additions:

1. **A progress indicator** (`●●○○ Step 2 of 4`) on the four setup screens, so the end always feels near.
2. **A consistent, warm connective voice** — a short affirming transition line at the top of each step that reads as one voice carrying the user through.

Recognition is reframed as a celebratory *finale* (the payoff), not a numbered step — so the flow visibly ends at step 4.

**Why not the alternatives:**

- **Chat-style wizard** — most literally conversational, but a much larger build and risks feeling slow/tedious across many turns. The participant wanted the flow to feel guided, not to chat with a bot.
- **Guide avatar overlay** — adds personality but also visual clutter on screens that are already busy with headings, helpers, and science notes.
- **Echoing the user's typed words** ("'Pass IFN637' it is") — the most personal option, but the user chose a warm-but-generic voice to keep copy simple and avoid threading input text through transition strings.

The chosen approach is the lowest-tedium change with the biggest perceived improvement.

---

## Design

### 1. `OnboardingProgress` component (new)

A pure presentational component. Given the current step, it renders a dot row and a step label.

**Files:**
- `src/components/OnboardingProgress.jsx`
- `src/components/OnboardingProgress.module.css`

**Props:**
- `step` (number, 1–4) — the current step. Total is hard-coded to 4 (the four setup steps).

**Markup & behaviour:**
- A container with `aria-label={`Step ${step} of 4`}`.
- Four dots: dot `i` (1-indexed) is filled when `i <= step`, hollow otherwise. Dots are `aria-hidden="true"`.
- A visible `Step {step} of 4` text label.

```jsx
import styles from './OnboardingProgress.module.css'

const TOTAL = 4

export default function OnboardingProgress({ step }) {
  return (
    <div className={styles.progress} aria-label={`Step ${step} of ${TOTAL}`}>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i + 1 <= step ? styles.dotFilled : ''}`}
          />
        ))}
      </div>
      <span className={styles.label}>Step {step} of {TOTAL}</span>
    </div>
  )
}
```

**Styling** (`OnboardingProgress.module.css`) — compact, using existing design tokens:
- `.progress` — flex row, dots and label aligned, small bottom margin (`var(--space-3)` or similar), sits above the back button / heading.
- `.dots` — flex row of dots with a small gap.
- `.dot` — small circle (~8px), light grey background (hollow state).
- `.dotFilled` — brand purple background (use the same purple the app uses elsewhere, e.g. the value behind existing accent classes).
- `.label` — ~10px, body-gray, slightly left-margined from the dots.

### 2. Progress placement

Render `<OnboardingProgress step={N} />` at the very top of each setup screen, above the `BackButton` (where present) and heading:

- `GoalSetup` → `step={1}`
- `GoalActions` → `step={2}`
- `Cadence` → `step={3}`
- `OfferedSocial` → `step={4}`

**Not** rendered on `Recognition` (the finale).

### 3. Connective voice

A warm, affirming, generic transition line — the same visual treatment on each screen so it reads as one consistent voice.

| Step | Screen | Treatment | Copy |
|---|---|---|---|
| 1 | GoalSetup | Keep existing subhead | "Huddel plans around real life — so your goals bend when your week does." (unchanged) |
| 2 | GoalActions | **Add** a `.greeting` line above the existing `goalName` eyebrow + heading | "Great start — now let's break it into doable steps." |
| 3 | Cadence | **Replace** the `<h1>` heading | "Nice work. Now, how often can you realistically work on it?" |
| 4 | OfferedSocial | **Replace** the `<h1>` heading | "Almost there — want someone in your corner?" |

**Duplication rule:** On Cadence and OfferedSocial the affirming line would otherwise echo the existing heading almost word-for-word, so the greeting *becomes* the heading (rendered in the existing `.headline` class so layout/styling is unchanged). On GoalActions the greeting is *additive* — it sits above the distinct, still-useful "Break it into milestones" heading.

**GoalActions `.greeting` placement & styling:** rendered **directly below the `<h1>` "Break it into milestones" heading and above the science note**. It is a single friendly line in body color, slightly larger than the helper text. Add a `.greeting` class to `GoalActions.module.css`. The eyebrow (`goalName`), heading, science note, and helper text are all otherwise unchanged.

### 4. Recognition finale

Copy-only reframing so the last screen reads as a celebratory payoff:

- Heading: "You're set up. Try it once." → **"🎉 You're all set up! Try it once."**

Everything else on Recognition (the complete-control list, peak message, science note, continue/skip buttons, `enterApp` logic) is unchanged.

### Data flow

Nothing touches AppContext or the state shape. `OnboardingProgress` is presentational (prop only). All other changes are static copy or a single component insertion per screen. Wizard navigation (`goTo`/`goBack`), `canAdvance` guards, skip logic, and `enterApp` are all unchanged.

---

## Scope

**In scope:**
- Create `src/components/OnboardingProgress.jsx`, `OnboardingProgress.module.css`, `OnboardingProgress.test.jsx`
- `src/screens/GoalSetup.jsx` — add `<OnboardingProgress step={1} />`
- `src/screens/GoalActions.jsx` — add `<OnboardingProgress step={2} />` + `.greeting` line; add `.greeting` to `GoalActions.module.css`
- `src/screens/Cadence.jsx` — add `<OnboardingProgress step={3} />`; greeting replaces heading text
- `src/screens/OfferedSocial.jsx` — add `<OnboardingProgress step={4} />`; greeting replaces heading text
- `src/screens/Recognition.jsx` — celebratory heading copy
- Update each affected screen's test file for new/changed copy and progress presence

**Out of scope:**
- No chat UI, no guide avatar / persona character
- No new screens, no change to flow order or navigation
- No echoing of the user's typed goal/milestone text into transition copy (generic voice)
- No AppContext / state-shape changes
- No changes to ReturnView or any post-onboarding screen
- No progress indicator on Recognition (it is the finale)

---

## Testing

**`OnboardingProgress.test.jsx`:**
- Renders with `aria-label="Step 2 of 4"` when `step={2}`.
- Renders 2 filled dots and 2 hollow dots when `step={2}` (assert via class on the dot spans).
- Renders the visible "Step 2 of 4" label.

**Screen tests** (`GoalSetup`, `GoalActions`, `Cadence`, `OfferedSocial`):
- The progress indicator is present with the correct step (assert the `Step N of 4` label / `aria-label`).
- The new/changed connective copy is present.
- For Cadence and OfferedSocial: update existing heading-text assertions from the old headings to the new greeting text.

**`Recognition.test.jsx`:**
- Update the heading assertion to the new celebratory copy.
- Confirm no progress indicator is rendered (it is the finale).
