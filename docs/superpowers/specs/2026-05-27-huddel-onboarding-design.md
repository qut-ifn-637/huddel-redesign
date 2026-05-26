# Huddel Onboarding Prototype — Design Spec

**Date:** 2026-05-27  
**Project:** IFN637 Assignment 3 · Huddel onboarding redesign · Team 2  
**Stack:** React + Vite, CSS Modules, AppContext, no external state library

---

## One-sentence spine

Huddel was asking users to set outcome-based "milestones" when this cohort reasons in effort and time. This redesign lets them plan goals as **effort-based actions at a cadence they choose**, recognises progress **calmly rather than through pressure mechanics**, and keeps the supportive "huddle" present but **safe and optional**.

---

## Tech decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | React (Vite) | Component per screen, fast dev server |
| State | AppContext + useState | No extra deps, idiomatic for 6-screen linear flow |
| Styling | CSS Modules + global CSS tokens | Token compliance auditable, scoped per screen |
| Fonts | Fraunces (Google Fonts) for headings, Inter for body | Gelica unavailable; Fraunces matches warm character |
| Layout | Full-width responsive, max 390px, centered | Mobile-first without phone-frame chrome |
| Routing | `currentScreen` string in App.jsx, `goTo()` in context | No React Router needed for a linear demo |

---

## Project structure

```
prototype/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx                    ← router + AppContext provider
│   ├── context/
│   │   └── AppContext.jsx         ← state shape + goTo()
│   ├── styles/
│   │   └── global.css             ← CSS custom properties (tokens), resets, shared utilities
│   ├── screens/
│   │   ├── Welcome.jsx + Welcome.module.css
│   │   ├── GoalActions.jsx + GoalActions.module.css
│   │   ├── Cadence.jsx + Cadence.module.css
│   │   ├── OfferedSocial.jsx + OfferedSocial.module.css
│   │   ├── Recognition.jsx + Recognition.module.css
│   │   └── ReturnView.jsx + ReturnView.module.css
│   └── components/
│       ├── PrimaryButton.jsx      ← full-width purple pill, 20px radius
│       ├── SkipButton.jsx         ← text-only, Body Gray
│       ├── OptionCard.jsx         ← beige single-select card, purple outline when active
│       └── CompleteControl.jsx    ← circle → green tick animation (<200ms), shared S05+S06
└── specs/                         ← spec files (untouched)
```

---

## State shape

Exact match to `99_state_and_navigation.md`:

```js
{
  context: null,            // 'work' | 'study' | 'both' | 'life_full'
  goalName: '',
  actions: [
    // { id, label, source: 'effort'|'outcome'|'custom', completed: false }
    // Pre-seeded with one worked example ({ label: 'Write 400 words', source: 'effort' }) on init
  ],
  cadence: 'few_times_week', // 'few_times_week' | 'most_days' | 'specific_days' | 'when_i_can'
  cadenceDays: [],           // only populated when cadence === 'specific_days'
  supporters: [],            // { name, role } — empty is valid (skip path)
}
```

State lives in `AppContext`. No localStorage/sessionStorage. Resets on page refresh (demo-appropriate).

---

## Routing

| Screen ID | Component | Forward trigger | Destination |
|---|---|---|---|
| `welcome` | Welcome | Continue (after select) | `goal-actions` |
| `goal-actions` | GoalActions | Next (goalName + ≥1 action) | `cadence` |
| `cadence` | Cadence | Next | `offered-social` |
| `offered-social` | OfferedSocial | Done — continue | `recognition` |
| `offered-social` | OfferedSocial | Skip for now | `recognition` |
| `recognition` | Recognition | See what tomorrow looks like → | `return-view` |
| `return-view` | ReturnView | (landing) | — |
| `return-view` | ReturnView | Supporter re-offer tapped | `offered-social` |

Transition: CSS fade-out (150ms) → swap component → fade-in (150ms) driven by `goTo()`.

---

## Screen designs

### S01 — Welcome

- Fraunces 32px headline: "What's pulling at your time right now?"
- Inter 16px subhead (Body Gray): "Huddel plans around real life…"
- 4 `OptionCard`s: Work / Study / Both work and study / Life's just full right now
- Single-select; purple outline + light purple tint on active
- `PrimaryButton` "Continue" disabled until selection made
- Stores: `context`

### S02 — Goal + Effort Actions *(heart of the prototype)*

- Fraunces 28px headline: "What are you working toward?"
- Goal name text input (placeholder: "e.g. Finish my essay")
- Section label + helper text (Body Gray 14px)
- Segmented tab control: "By effort" (purple, default) / "By outcome"
  - Effort chips: Write 400 words · Read for 30 min · Practice 20 min · Draft one section · + Write my own
  - Outcome chips: Finish a chapter · Submit a draft · + Write my own
- Action list: beige cards, pre-seeded with "Write 400 words" on mount, removable
- "+ Write my own" opens inline text field; submit adds custom action
- `PrimaryButton` "Next" disabled until goalName non-empty AND actions.length ≥ 1
- Stores: `goalName`, `actions[]`

### S03 — Cadence

- Fraunces 28px: "How often feels realistic?"
- Helper (Body Gray 14px): "No wrong answer. You can change this whenever your week changes."
- 4 `OptionCard`s: A few times a week (default-highlighted) / Most days / Specific days / Whenever I can
- "Specific days" reveals inline M T W T F S S chip row (multi-select)
- Contextual reassurance line: shown if context is 'both' or 'life_full'
- `PrimaryButton` "Next"
- Stores: `cadence`, `cadenceDays[]`

### S04 — Offered Social *(skippable)*

- Fraunces 28px: "Want someone in your corner?"
- Subhead + avatar-group decorative element
- Name input + 4 role chips: Close peer / Family / Study friend / Work — availability only
- Selected chip shows one-line visibility description beneath it
- "Add" pushes `{ name, role }` to `supporters[]`
- Two bottom buttons always visible: `PrimaryButton` "Done — continue" + `SkipButton` "Skip for now"
- Both route to `recognition`

### S05 — Recognition *(emotional payoff)*

- Fraunces 26px: "You're set up. Try it once."
- First action rendered as prominent card with `CompleteControl`
- Helper: "Tap to mark it done — this is the move you'll come back for."
- On tap: green tick draws in <200ms, card background shifts, message "That's one done. This is how progress adds up." appears
- After 1.5s: continue affordance fades in
  - Default: "See what tomorrow looks like →"
  - If cadence === 'when_i_can': "See your home base →"
- No confetti, no streak counter, no badge

### S06 — Return View *(home base)*

- Fraunces 24px "Welcome back." + goalName prominently
- Completed action shown ticked green at top of view (visible within first ~10s)
  - Rhythm cadence: "1 action done · keep it rolling"
  - when_i_can: "1 action done so far"
- Remaining actions as `CompleteControl` cards (same animation as S05)
- Supporter section: conditional on `supporters[]` non-empty
  - Has supporters: "Your [role label] can cheer this on."
  - No supporters: soft re-offer (links to S04, never modal/blocking)
- Primary: `PrimaryButton` "Mark today's action done" or "You're all caught up — nicely done." when all complete

---

## Shared components

### PrimaryButton
- Full-width, pill (20px border-radius), Huddel Purple fill, white Inter 600 16px label
- Bottom-third placement enforced by screen layout (sticky or fixed bottom padding)
- `disabled` prop dims opacity and blocks pointer events

### SkipButton
- Text-only, Body Gray, no fill, no border
- Always clearly visible alongside primary (never hidden or low-contrast)

### OptionCard
- Beige (#f4f3ec) background, 20px radius, no shadow
- Active state: Purple (#5015ff) 2px outline + light purple tint background
- Full-width, generous tap target

### CompleteControl
- Empty circle (24px, gray border) by default
- On tap: border and fill transition to Success Green (#2feb7d), checkmark SVG draws in via stroke-dashoffset animation, total <200ms
- Identical on S05 and S06

---

## Design-token enforcement (non-negotiables)

- "milestone" never appears in any string
- Max 3 accent colors per screen
- Sunshine Yellow (#fff493) never used for text
- Primary buttons always in bottom third, full-width, 20px radius
- No streaks, badges, points, or confetti
- Cadence propagates: `when_i_can` users never see rhythm/streak language

---

## Demo-readiness checklist (from spec)

- [ ] 01→06 clickable end-to-end with no dead ends
- [ ] "Milestone" appears nowhere in the UI
- [ ] Effort tab pre-selected and visually primary on S02
- [ ] One worked-example action pre-seeded on S02
- [ ] Cadence includes "Whenever I can"; downstream copy honours it
- [ ] S04 skippable in one tap; skip reaches S05
- [ ] Recognition is calm: green tick + one quiet peak, no streak/badge/confetti
- [ ] Return view shows completed action within first ~10s
- [ ] Huddel tokens applied; ≤3 accent colors per screen; no yellow text
- [ ] Mobile-shaped, primary actions thumb-reachable
