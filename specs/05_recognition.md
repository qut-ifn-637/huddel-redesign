# Screen 05 — First "Mark Complete" + Calm Recognition  *(THE EMOTIONAL PAYOFF)*

**Specs:** Spec 3 (+ Spec 1, Spec 6) · **Theme 4** · **Success criterion 3 (seed)**
**Routes to:** Screen 06 (Return view)

---

## Purpose

Let the user mark their first action complete *inside* onboarding, so they've already done the most-repeated thing once before they're on their own. Then deliver **one calm positive peak** — warm and distinct, but not gamified. This is where Theme 4's gap (no participant ever felt *recognised*) is answered, and where your sharpest design-judgement line lives: **calm over gamified, because pressure mechanics punish this cohort's unpredictable schedules.**

## Layout (top → bottom)

1. **Gelica headline** (~26px): `You're set up. Try it once.`
2. **The user's first action** rendered as a single prominent card (the worked example or their own first action), with a large, thumb-reachable **tap-to-complete control** (an empty circle / check affordance).
3. **Inter helper** (Body Gray): `Tap to mark it done — this is the move you'll come back for.`

### On tap (the recognition moment):
- **Instant micro-feedback (< 0.2s):** the circle fills with Success Green, a checkmark draws in. This must feel immediate — it is the perceptual-feedback window.
- **One calm positive peak:** a brief, warm acknowledgement — e.g. a soft Purple/Green state change across the card, a gentle one-time message: `That's one done. This is how progress adds up.` No confetti. No streak counter. No points. No sound-effect slot-machine energy. A *single* quiet, distinct moment.
- After ~1.5s, surface the **continue affordance:** `See what tomorrow looks like →` (or cadence-appropriate wording — if cadence is `when_i_can`, use `See your home base →`).

## Copy (verbatim)

- Headline: **You're set up. Try it once.**
- Helper: **Tap to mark it done — this is the move you'll come back for.**
- Peak message: **That's one done. This is how progress adds up.**
- Continue (default): **See what tomorrow looks like →**
- Continue (if cadence = when_i_can): **See your home base →**

## Interaction

- Tapping the action control sets that action's `completed = true` in state and triggers the recognition animation.
- The continue affordance routes to Screen 06.
- **Honour cadence:** never imply a daily expectation in the copy if cadence isn't daily-ish.

## Research note

Three evidence strands converge here, all from your A3 Research Note:
- **Perceptual feedback:** users expect visible response within 0.1–0.2s; the green tick must be instant.
- **Peak-End Rule:** a single calm positive peak at first completion anchors the memory of the app as rewarding — borrow the principle without the noise.
- **Anti-streak stance:** rigid streaks/badges punish missed shift-nights and risk abandonment; calm recognition is the deliberate alternative (ties to Spec 6 — a private moment with a missed effort, no public consequence).

On camera: *"I chose calm recognition over streaks because the evidence shows rigid streaks punish exactly the unpredictable schedules that define this cohort — a missed day shouldn't read as failure."*

## Out of scope

No social broadcast of the completion (even if a supporter was added — that's a later, offered moment, not automatic; automatic exposure was the A2 trust problem). No reward/pledge flow. Keep the peak singular and quiet.
