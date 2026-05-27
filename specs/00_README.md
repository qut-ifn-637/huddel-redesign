# Huddel Onboarding Redesign — Prototype Build Specs

**Project:** IFN637 Assignment 3 · Huddel onboarding redesign · Team 2
**Build target:** Clickable, end-to-end mobile-shaped interactive prototype (vibe-coded).
**Platform:** Mobile-first. Design every screen for a phone frame (~390px wide). One-handed, thumb-reachable primary actions.

---

## The one-sentence spine (build everything to serve this)

> *Huddel's original onboarding set outcome-based milestones with no controllable effort layer and no schedule flexibility, so this cohort — students juggling work and study — stalled when a week blew up. This redesign keeps **proximal milestones** (Bandura & Schunk 1981 — they drive momentum and self-efficacy) but nests **effort-based actions** beneath them as the recognised unit of progress (Pham & Taylor 1999), at a user-chosen cadence — so effort counts even when outcomes slip.*

If a design decision does not serve achievable, effort-based planning, it is out of scope.

---

## What this prototype is (and is not)

- **Is:** the full *happy path* of a redesigned first-time onboarding flow, ending on a return view that rewards coming back.
- **Is not:** the whole app. Do not build settings, full feeds, profile editing, or any screen not listed here. Build the slice that proves the idea.

---

## Screen flow (happy path)

```
01 Welcome / cohort-fit  →  02 Goal + effort actions  →  03 Cadence
        →  04 Offered social (skippable)  →  05 First mark-complete + recognition
        →  06 Return view
```

Screen 04 is **skippable in one tap**. Skipping routes directly to Screen 05.

---

## Design-spec traceability (why each screen exists)

| Screen | A2 Specs | Themes | Success criteria |
|--------|----------|--------|------------------|
| 01 Welcome | Spec 7 (mobile), flexibility framing | Theme 1 | — |
| 02 Goal + effort actions | Spec 2, Spec 8 | Theme 1, 3 | Criterion 2 |
| 03 Cadence | Spec 2, flexibility (Ekhtiar) | Theme 3 | Criterion 2 |
| 04 Offered social | Spec 4 | Theme 2 | Criterion 4 |
| 05 Recognition | Spec 3 (+1, 6) | Theme 4 | Criterion 3 (seed) |
| 06 Return view | Spec 1, Spec 7 | Theme 3, 4 | Criterion 1, 3 |

Keep this table visible in the build; the marker rewards traceability.

---

## Non-negotiable design rules (apply on every screen)

1. **A milestone is never a bare outcome deadline** — it is always paired with effort-based actions underneath it, and progress is recognised at the effort-action level. Use "milestone" for the proximal sub-goal layer and "action" for the controllable effort beneath it.
2. **No streak counters, no badges, no points, no confetti-on-every-tap.** Recognition is calm and occasional (see Screen 05). Pressure mechanics punish this cohort's unpredictable schedules.
3. **Cadence is user-chosen, never assumed.** Do not hard-code "daily." See Screen 03.
4. **Setup never gates behind adding a supporter.** Screen 04 is always skippable.
5. **Use only the Huddel design tokens** in `tokens.md`. Max 3 accent colors per screen. Never use Sunshine Yellow for text.
6. **Primary actions are thumb-reachable** — bottom third of the screen, full-width pill buttons, 20px radius.

---

## Authorship & ethics note (for the human, not the agent)

This prototype is an IFN637 A3 deliverable and must be genuinely authored by the student. If AI coding assistance is used to build it, **all prompts and AI outputs must be screenshotted and included in the A3 references** (ethics band, 20 pts). Hand-drawn sketches are a separate, required, human-only integrity step and are NOT replaced by these specs or by any coded build. No participant data (test recordings, notes, transcripts) may pass through any cloud AI tool — use the offline Gemma setup only.

---

## File index

- `tokens.md` — colors, type, spacing, components. Read first.
- `01_welcome.md` … `06_return_view.md` — one screen each.
- `99_state_and_navigation.md` — the data the prototype must carry between screens, and the click-routing map.
