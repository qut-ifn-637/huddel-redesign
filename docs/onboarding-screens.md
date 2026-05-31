# Huddel Onboarding — Living Design Reference

> **Living document.** This is the source of truth for *why each onboarding screen exists and how it's designed*. Update it whenever an onboarding screen changes. Sections marked **⏳ Pending** describe an agreed design not yet in code.

**Last updated:** 2026-05-31

---

## The thesis these screens serve

Huddel is a **calm, effort-based** goal companion. Four principles run through every onboarding screen:

1. **Effort over outcome.** Progress is recognised as the small actions you actually do (Pham & Taylor, 1999), not just finish-lines.
2. **Proximal milestones build momentum.** Near-term sub-goals sustain motivation and confidence (Bandura & Schunk, 1981).
3. **Plans bend.** Cadence and dates are self-chosen and movable; "no wrong answer." The app flexes with real life rather than punishing slippage.
4. **Controlled exposure, no pressure mechanics.** You choose who sees what (Gollwitzer et al., 2009 — over-broadcasting an identity goal can sap drive). No streaks, scores, points, or badges anywhere.

A cited "science note" (the global `.scienceNote` style) appears on most screens to make the reasoning visible without competing with the primary content.

## Flow & progress model

```
GoalSetup → GoalActions → Cadence → OfferedSocial → Recognition → (app shell)
  step 1       step 2       step 3      step 4        finale
```

`OnboardingProgress` (`●●○○ Step N of 4`) anchors the **four setup screens**. **Recognition is deliberately not numbered** — it's the celebratory payoff, not a fifth chore. The science notes sit just above the continue button on the setup screens (moved there to keep the top of each screen uncluttered).

---

## 1. GoalSetup — "What goal are you working on?"

- **Purpose:** Capture one specific, meaningful goal. The single most important input; everything else hangs off it.
- **Reasoning:** Specific, meaningful goals are pursued harder (Locke & Latham, 2002). The helper nudges specificity ("'Pass IFN637', not 'do better'").
- **Design:** Brand wordmark; value-prop subhead ("Huddel plans around real life — so your goals bend when your week does"); a single text input; specificity helper; `OnboardingProgress step={1}`. Continue is disabled until a goal name is entered.

## 2. GoalActions — "Break it into milestones"

- **Purpose:** Decompose the goal into milestones, each holding small **effort-based actions**; optionally set a soft target date per milestone.
- **Reasoning:** Near-term milestones build momentum and confidence (Bandura & Schunk, 1981). Actions are framed as effort, not outcomes — "Describe what you'll do, not the finish line" (Pham & Taylor, 1999).
- **Design:**
  - Connective greeting ("Great start — now let's map out the doable steps") below the heading.
  - A **dismissible worked example** (lit-review milestone) so the milestone→action hierarchy is obvious without explanation.
  - `MilestoneCard` accordion: editable name; effort-action chips + "write my own"; a **Recurring / One-time** toggle per action (`kind: 'repeat'|'once'`); and an optional **"Hope to finish by"** date row (quick presets *This week / 2 weeks / 1 month* + "Pick a date").
  - `OnboardingProgress step={2}`. Advancing prunes milestones with no actions.

## 3. Cadence — "Nice work. Now, how often can you realistically work on it?"

- **Purpose:** Set a sustainable working rhythm.
- **Reasoning:** A cadence you'll actually keep protects commitment (Locke & Latham, 2002). The framing is pressure-free: "No wrong answer. You can change this whenever your week changes."
- **Design:** Four options — *A few times a week / Most days / Specific days / Whenever I can*; a day-picker appears for "Specific days"; choosing "Whenever I can" surfaces gentle reassurance ("irregular weeks are exactly what this is built for"). `OnboardingProgress step={3}`.

## 4. OfferedSocial — "Almost there — want someone in your corner?"

- **Purpose:** Optionally add supporters and choose, per person, **how much they see and what they can do** — the controlled-exposure control.
- **Reasoning:** We follow through more for people we respect (Klein et al., 2020), but broadcasting a goal too widely can sap drive (Gollwitzer et al., 2009). The fix is *graduated, per-person visibility* — share the vulnerable parts with the few you trust, the highlights with a wider circle. Adding people is always optional and skippable.
- **Design:** Name/contact input; the **three privacy tiers** (see below); a recommended default; skippable. `OnboardingProgress step={4}`.

### Privacy tiers (re-based) ⏳ Pending implementation

**Problem with the old model:** the lowest tier was "Just availability" — *they see only that you're busy, not your goal* — pitched at a manager/coworker. But a work contact will never install a goal-support app just to broadcast "I'm busy," so that tier solved an imagined problem. And the middle tier ("Progress") incoherently hid the goal name.

**Principle:** everyone in your huddle **opted in to support this goal**, so the meaningful axis isn't "do they see the goal" — it's **how much of the hard stuff they see, and what they can do.** Re-based as a single clean ladder (each tier sees strictly more than the one below):

| Tier | Sees | Can do | Who it's for |
|---|---|---|---|
| **Everything** | goal + progress + **slipped milestones** | Send encouragement / Check in | partner, accountability buddy |
| **Progress** *(recommended default)* | goal + **wins only** (never the hard days) | Cheer a win | friends, family |
| **Goal only** | just the **goal you've committed to** (no progress, no struggles) | — (telling them *is* the support) | someone you've told, as a light commitment device |

- **Why "Goal only" at the floor:** publicly committing to a goal — even to one person who never monitors you — aids follow-through. It's the lightest, lowest-exposure way to be "in someone's view," and it serves a real person who'd actually be in the app.
- **Reciprocity:** the tier you give someone governs both what you see of *them* and how you can support them — Everything ↔ check in on the hard days; Progress ↔ cheer wins; Goal only ↔ no action (knowing is the point).
- **Naming note:** the middle tier stays **"Progress"** (not "Cheers") to avoid colliding with the app's **Cheers** tab.
- **Dropped:** the "availability / I'm busy / give them space" tier and its no-action "restraint as support" framing. (If a "resting / muted" idea returns, it should be a per-person *state*, not a tier.)

*Implementation touches:* `src/data/roles.js` (tier definitions + the `availability`→`goal-only` value), `src/components/SupportingCard.jsx` (replace the availability branch; make Progress show the goal), `src/screens/OfferedSocial.jsx` + `src/screens/MyHuddleView.jsx` (selection copy), `src/screens/ReturnView.jsx` ("sees" labels), and the demo `supporting` data in `AppContext` (the Jordan entry).

## 5. Recognition — "🎉 You're all set up! Try it once."

- **Purpose:** Convert setup into a first win before entering the app — prove the core loop (mark an action done) feels good.
- **Reasoning:** Finishing one small action builds the confidence that drives the next (Bandura & Schunk, 1981). Framed as a celebratory finale, not a task.
- **Design:** No progress dots. Lists the user's actions; completing one reveals a peak message ("That's one done. This is how progress adds up.") and the science note; a continue button then enters the app shell (`enterApp`). Skippable.

---

## Cross-cutting components

- **`OnboardingProgress`** — `●●○○ Step N of 4` on the four setup screens (`role="img"` + `aria-label`; decorative dots `aria-hidden`; `data-filled` hook).
- **Palette** — warm "lavender + coral": cream paper, mauve-lavender card surfaces, brand purple as the single primary-action colour, coral as the restrained secondary accent. No streak/score visuals.

## Post-onboarding hooks (context, not onboarding)

The home screen (`ReturnView`) reads what onboarding produced: per-milestone status chips (On track / Due soon / Slipped) from soft target dates, a "Reached it ✓" toggle with a brief confetti + "Milestone reached 🎉" celebration, and a gentle slipped→support prompt. Supporter cards (`SupportingCard`) render the role-differentiated view the tiers define.

---

## Change log

- **2026-05-31** — Created. Privacy tiers re-based (Everything / Progress / Goal only), replacing the "Just availability" floor; implementation pending.
