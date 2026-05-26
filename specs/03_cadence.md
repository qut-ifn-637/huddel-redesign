# Screen 03 — Cadence (User-Chosen Frequency)

**Specs:** Spec 2, Ekhtiar flexibility principle · **Theme 3** · **Success criterion 2**
**Routes to:** Screen 04 (Offered social)

---

## Purpose

Let the user choose **how often** they want to do their actions — and crucially, allow "when I can" as a first-class option. This screen exists because **"daily" is an assumption that smuggles pressure back in.** A student who can only realistically touch a goal on the days they're not on shift should not be set up to fail daily. Effort-based framing is the win; rigid cadence would undo it.

## Layout (top → bottom)

1. **Gelica headline** (~28px): `How often feels realistic?`
2. **Helper line** (Body Gray, 14px): `No wrong answer. You can change this whenever your week changes.`
3. **Single-select cadence cards** (Beige, 20px radius, one active):
   - `A few times a week` *(default-highlighted as the gentle, realistic option)*
   - `Most days`
   - `Specific days` → reveals a lightweight day-of-week selector (M T W T F S S) when chosen
   - `Whenever I can` *(explicitly framed as valid, not lazy)*
4. **Contextual reassurance line** — if `context` from Screen 01 is `Both work and study` or `Life's just full right now`, show: `Smart pick — irregular weeks are exactly what this is built for.`
5. **Primary button** (bottom third): `Next`.

## Copy (verbatim)

- Headline: **How often feels realistic?**
- Helper: **No wrong answer. You can change this whenever your week changes.**
- Options: **A few times a week** / **Most days** / **Specific days** / **Whenever I can**
- Reassurance (conditional): **Smart pick — irregular weeks are exactly what this is built for.**
- Button: **Next**

## Interaction

- Single-select. "Specific days" expands an inline day picker (multi-select chips); store selected days.
- Store `cadence` in state: one of `few_times_week | most_days | specific_days | when_i_can`, plus `cadenceDays[]` if specific.
- **Recognition logic downstream keys off this cadence, NOT a calendar streak.** A user on "whenever I can" must never see a "you missed a day" message. Carry `cadence` forward so Screen 05/06 honour it.

## Research note

This is the design move that makes effort-framing genuinely safe for the cohort: removing the daily assumption ties Spec 2/8 directly to the Ekhtiar flexibility principle you already cite. On camera: *"I removed the daily assumption because the cohort's schedules are unpredictable — effort units bend where fixed cadences break."*

## Out of scope

No reminders/notification setup (a returning-user concern, not first-session). No calendar integration. Keep it to choosing a rhythm.
