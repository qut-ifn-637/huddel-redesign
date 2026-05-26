# Screen 06 — Return View (Home Base)

**Specs:** Spec 1 (one-tap maintenance), Spec 7 (mobile) · **Theme 3, 4** · **Success criteria 1 & 3**
**Routes to:** end of happy path (this is the landing screen).

---

## Purpose

Close the arc. The user "returns" (simulate first-return state) and within ~10 seconds sees that their progress is real and that coming back is rewarded — not just that they're enrolled. The single most-repeated action ("mark complete") is a one-tap, thumb-reachable primary action. This screen answers Theme 3 (lost completion action) and Theme 4 (no recognition) at once.

## Layout (top → bottom)

1. **Warm greeting** (Gelica, ~24px): `Welcome back.` + the user's `goalName` shown prominently.
2. **Progress reflection (visible within first ~10s, top of view):** a *calm* completion indicator — e.g. `1 action done · keep it rolling` with the completed action shown ticked in Success Green. This is the goal-gradient benefit WITHOUT the obligation trap: show momentum, never frame "incomplete" as "inadequate."
   - **Do NOT** render a streak count, a percentage that implies a deadline, or a "you missed X" message. If cadence is `when_i_can`, phrase progress as cumulative ("3 actions done so far"), never as a rhythm the user is behind on.
3. **Today's / next actions list:** the remaining actions as cards, each with a **one-tap complete control** (the same affordance from Screen 05). The primary one-tap action sits thumb-reachable.
4. **Supporters (only if `supporters[]` is non-empty):** a small avatar group with a gentle line, e.g. `Your study friend can cheer this on.` If empty, show a soft, non-nagging re-offer: `Want to add someone to cheer you on? (optional)` — tappable but never modal/blocking.
5. **Bottom primary action:** `Mark today's action done` (or, if all done, a calm `You're all caught up` state).

## Copy (verbatim)

- Greeting: **Welcome back.**
- Progress (rhythm cadence): **1 action done · keep it rolling**
- Progress (when_i_can): **1 action done so far**
- Supporter line (has supporters): **Your study friend can cheer this on.**
- Supporter re-offer (no supporters): **Want to add someone to cheer you on? (optional)**
- Primary: **Mark today's action done**
- All-done state: **You're all caught up — nicely done.**

## Interaction

- Reads `goalName`, `actions[]`, `cadence`, `supporters[]` from state; renders accordingly.
- Tapping a complete control marks it done with the same instant Green-tick micro-feedback as Screen 05 (consistency matters).
- The supporter re-offer (empty state) can route back to Screen 04 if tapped — demonstrating the "add people any time later" promise — but is never forced.

## Research note

This is success criterion 3 made concrete: the completed action is the first thing visible on return. It's also the Spec 1 payoff — the most-repeated action is one tap and thumb-reachable. The calm progress indicator deliberately takes the goal-gradient *benefit* (momentum motivates) while refusing its *failure mode* (incomplete = inadequate), which your Research Note flags as actively harmful for a guilt-prone cohort.

On camera: *"The return view shows the completed action within the first few seconds — so a returning user is rewarded, not just re-enrolled — and 'mark complete' is one thumb-tap, fixing the lost completion action from Theme 3."*

## Out of scope

No full activity feed, no notifications centre, no goal-editing screens. This is the home base that proves the loop closes — not the full app.
