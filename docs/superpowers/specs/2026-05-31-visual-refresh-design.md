# Visual Refresh (Warm Lavender) — Design Spec

**Date:** 2026-05-31
**Improvement:** #5 from usability test findings (Medium severity) — slice A of 4
**File:** `docs/design-improvements.md` — "Visual design — too plain and formal"
**Affects:** `src/styles/global.css` + most component/screen CSS modules (CSS-only; no JSX, no behaviour)

---

## Problem

The participant found the prototype functional but uninviting — "plain," "formal," "not attractive to the eye" — and cited this as a barrier to opening the app voluntarily each day.

> "It's very formal… more colours… you could customise your own colours, customise where it goes, have little widgets to remind you." (21:57, 22:11)

Improvement #5 as written bundles four independent features. This spec covers **slice A — a cohesive visual refresh** (palette/warmth across the existing screens). The other slices are separate future cycles:

- **B — theme / accent picker** ("customise your own colours")
- **C — completion micro-celebrations** (calm checkmark / soft confetti)
- **D — dashboard personality** (daily greeting, calm progress visual)
- **Widgets** — a real-OS home-screen feature, not feasible in a React web prototype; noted as a roadmap item only.

**Thesis guardrail:** the project is deliberately calm and non-gamified (rule #2 — no streaks/points/badges/pressure). This refresh changes only mood and colour; it introduces no streaks, scores, or pressure mechanics.

---

## Decision

Recolour the app to a **warm lavender + coral** palette ("B2 + coral", chosen via visual companion), keeping the existing layout, typography (Fraunces + Inter), spacing, and radii unchanged. The work is a **full sweep**: remap the global design tokens AND tokenise the scattered hardcoded hex literals so every surface, border, and accent coheres on the new cream base.

**Role of colour:**
- **Purple (`#5015ff`, unchanged)** stays the single primary-action colour — it always reads as "the button."
- **Coral (`#d2603a`, new)** is a restrained warm accent on *optional / low-pressure* actions and the *needs-support* cue.
- **Green** remains the calm positive "win/progress" signal.

Rejected alternatives (from visual-companion exploration): Warm Cream (direction A — cosy but drifted off-brand from purple), Vibrant Blocks (direction C — too energetic for the calm thesis), and a token-remap-only approach (would leave cool borders/greys clashing on the warm base).

---

## Design

### 1. Token architecture (`src/styles/global.css`)

Strategy: **keep existing token names, remap their values** (so every `var(--color-…)` consumer updates for free) and **add new tokens** for what the palette introduces.

**Remapped (same name, new value):**

| Token | Old | New | Role |
|---|---|---|---|
| `--color-black` | `#060000` | `#2b2230` | warm ink — headings / strong text |
| `--color-body-gray` | `#474747` | `#6a5f60` | warm body text |
| `--color-beige` | `#f4f3ec` | `#f3ecf3` | card / section surface (mauve-lavender) |
| `--color-purple-tint` | `#ede8ff` | `#efe6f5` | lavender chips / tints |
| `--color-soft-blue` | `#f9fafb` | `#f3ece2` | outer bg behind shell + "quiet/muted" surface |

**Kept unchanged:** `--color-purple #5015ff`, `--color-white #ffffff`, `--color-success-green #2feb7d`, `--color-sunshine-yellow #fff493`, `--color-orange #eb672f`.

**New tokens:**

| Token | Value | Role |
|---|---|---|
| `--color-cream` | `#fbf5ee` | the app "paper": `#root`, BottomNav, `.bottomActions` gradient |
| `--color-coral` | `#d2603a` | secondary / tertiary accent |
| `--color-coral-tint` | `#fadfce` | coral chip backgrounds |
| `--color-line` | `#e7ddd0` | warm neutral borders |
| `--color-lavender-line` | `#e3d9ee` | soft lavender borders + idle interactive rings |
| `--color-muted` | `#9a8f92` | faint footnote / faint label text |
| `--color-progress-green` | `#2c9e63` | existing green "win/progress" text, tokenised |
| `--color-progress-tint` | `#e7f7ee` | existing green chip bg, tokenised |

Fonts, `--radius-*`, and `--space-*` are unchanged.

### 2. Surfaces, chrome & coral placement

**Surface hierarchy (3 warm levels):**
- **Page / `#root`** → `--color-cream` `#fbf5ee` (was white). The outer bg behind the 390px shell (global `body`) → `--color-soft-blue` (now `#f3ece2`), giving subtle layering on wide screens.
- **Cards / sections** → `--color-beige` (now mauve `#f3ecf3`) — handled by the remap.
- **Elevated surfaces** (the EncouragementSheet modal) stay `--color-white` `#ffffff` as an intentional "lifted" cue: cards mauve, page cream, sheet white = a clear 3-level depth read.

**Chrome that needs explicit attention (else it clashes):**
- **BottomNav** (`BottomNav.module.css`): background white → `--color-cream`; top border `#ececec` → `--color-line`; active tab stays purple.
- **`.bottomActions` gradient** (`global.css`): currently fades content into *white* — change to fade into `--color-cream` so it blends on the cream page.
- All borders tokenised: warm-neutral → `--color-line`; lavender → `--color-lavender-line`.

**Coral placement (restrained) — coral appears ONLY here:**

| Treatment | Element |
|---|---|
| `--color-coral` text | **SkipButton** ("Skip for now") |
| `--color-coral` text | **"+ Adapt my plan"** (`ReturnView` `.adaptBtn`) |
| `--color-coral` text | **"re-offer"** link (`ReturnView` `.reOffer`) |
| `--color-coral` text | **"struggling / needs support"** cue (`SupportingCard` `.scStruggle`, was brown `#a05a2c`) |
| `--color-coral-tint` bg + `--color-coral` text | the "needs support" status **pill** |

**Stays purple (`--color-purple`):** PrimaryButton, OnboardingProgress filled dots, OptionCard / MilestoneCard selected states, completed-action dot fill, BottomNav active tab, **BackButton** (brand navigation), "+ Add milestone".
**Stays green:** the "win/progress" positive cues (`--color-progress-green` / `--color-progress-tint`).

### 3. Hardcoded-hex sweep mapping

Every scattered literal maps to a token:

| Current literals | → Token |
|---|---|
| `#ddd` `#ccc` `#eee` `#ececec` `#e0e0e0` (neutral borders) | `--color-line` |
| `#e6e0ff` `#f0ecff` `#c8bfff` `#e8e4ff` `#c8bbff` (lavender borders/dividers) + CompleteControl idle dot ring `#ccc` | `--color-lavender-line` |
| `#999` `#aaa` `#bbb` (faint text) | `--color-muted` |
| `#2c9e63` (green text) / `#e7f7ee` (green chip bg) | `--color-progress-green` / `--color-progress-tint` |
| `#a05a2c` (struggle, brown) | `--color-coral` |
| `#f8f7ff` (example-card bg) | `--color-purple-tint` |
| `#8060dd` (example-card label) | `--color-purple` |

---

## Scope

**In scope (CSS-only):**
- `src/styles/global.css` — token block; `#root` background → cream; body bg; `.bottomActions` gradient → cream.
- CSS modules carrying hex literals or white/beige surfaces, including: `CompleteControl`, `MilestoneCard`, `BottomNav`, `SegmentedToggle`, `SupportingCard`, `EncouragementSheet`, `SkipButton` (→ coral), `GoalActions`, `GoalSetup`, `OfferedSocial`, `MyHuddleView`, `EncouragementsScreen`, `ReturnView` (`.adaptBtn` / `.reOffer` → coral; `#ccc` dashed → `--color-line`). The implementation plan will enumerate each file's exact edits.

**Out of scope:**
- No layout, spacing, radius, or typography changes.
- No behaviour or JSX changes (this is a pure CSS pass).
- No theme/accent picker (slice B), no micro-celebrations (slice C), no dashboard rework (slice D).
- Widgets remain a noted roadmap item, not built.

---

## Testing

This is a pure CSS change, so the rendered look is not unit-testable. Verification is:

1. **Full Vitest suite stays green.** Class names and markup are unchanged, so no test should break — this is the regression guard. Run `npm test`.
2. **Manual visual QA** via `npm run dev` at 390px, walking every screen: onboarding (GoalSetup → GoalActions → Cadence → OfferedSocial → Recognition) and the app shell (Goals / Huddle / Supporting / Cheers, including the EncouragementSheet). Confirm coherence and no leftover cool-on-warm colours.
3. **Contrast check** during QA: warm body text `#6a5f60` on cream/surface and coral links `#d2603a` meet WCAG AA legibility.
