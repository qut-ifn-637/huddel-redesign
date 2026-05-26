# Screen 01 — Welcome / Cohort-Fit Framing

**Specs:** Spec 7 (mobile-first), Ekhtiar flexibility framing · **Theme 1**
**Routes to:** Screen 02 (Goal + effort actions)

---

## Purpose

Open by acknowledging the user's real context (the work-study juggle) and set the expectation — before any goal is typed — that this app plans around effort and bends when life does. This single question justifies effort-based framing on the very next screen and signals "this app was built for someone like me."

## Layout (top → bottom)

1. **Brand mark** (small Huddel wordmark or logo), top-centre.
2. **Gelica headline** (~32px): `What's pulling at your time right now?`
3. **Inter subhead** (Body Gray, 16px): `Huddel plans around real life — so your goals bend when your week does.`
4. **Single-select option cards** (4), stacked, full-width, Beige surface, 20px radius. One selectable at a time (selected = Purple outline + light Purple tint):
   - `Work`
   - `Study`
   - `Both work and study`
   - `Life's just full right now`
5. **Primary button** (bottom third): `Continue` — disabled until one option is selected.

## Copy (verbatim — do not rewrite)

- Headline: **What's pulling at your time right now?**
- Subhead: **Huddel plans around real life — so your goals bend when your week does.**
- Button: **Continue**

## Interaction

- Tapping a card selects it (deselects others). Selection enables `Continue`.
- Store the choice as `context` in state (see `99_state_and_navigation.md`). It is referenced lightly on later screens (e.g. a one-line reassurance), so it must persist.

## Honeycomb / research note

This is the *Useful* + *Desirable* opener: it makes the cohort feel seen (Theme 1) and sets the flexibility frame (Ekhtiar) that the no-daily-assumption cadence design (Screen 03) pays off. Do not over-build it — one question, four options, move on.

## Out of scope

No account creation, no email/password, no permissions prompts. This is a prototype of the *experience*, not auth.
