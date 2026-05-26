# Screen 02 — Goal + Effort-Based Actions  *(THE HEART OF THE PROTOTYPE)*

**Specs:** Spec 2, Spec 8 · **Theme 1, 3** · **Success criterion 2**
**Routes to:** Screen 03 (Cadence)

---

## Purpose

This is the screen the whole redesign exists for, and the one to point the camera at. The user names a goal and breaks it into **effort-based actions** — described in their own effort-and-time language ("write 400 words," "30 minutes of reading") rather than outcome-waypoints. Effort templates are presented as the **default-feeling option**, sitting *beside* outcome templates, not hidden behind them. One action is lightly pre-filled as a worked example (endowed-progress nudge).

**The word "milestone" must not appear on this screen.**

## Layout (top → bottom)

1. **Gelica headline** (~28px): `What are you working toward?`
2. **Goal name input** (single line, Inter 16px, generous tap height). Placeholder: `e.g. Finish my essay`
3. **Section label** (Inter 600, 16px): `Break it into actions you can actually do`
4. **Helper line** (Body Gray, 14px): `Small efforts add up — describe each one by what you'll do, not the finish line.`
5. **Template chooser** — two tabs / segmented control, **"By effort" selected by default**:
   - **By effort** (default tab): chips the user can tap to add as actions —
     `Write 400 words` · `Read for 30 min` · `Practice 20 min` · `Draft one section` · `+ Write my own`
   - **By outcome** (secondary tab): `Finish a chapter` · `Submit a draft` · `+ Write my own`
   - The effort tab is visually primary (Purple active state); the outcome tab is available but not emphasised. This ordering is the Spec 2/8 design claim — do not flip it.
6. **Action list** — as the user taps chips or writes their own, actions appear as small Beige cards in a list. **Pre-seed the list with ONE worked example already filled in** (e.g. `Write 400 words` shown as added on load), so the user starts from non-zero. They can remove or edit it.
7. **Primary button** (bottom third): `Next` — enabled once a goal name exists and at least one action is in the list.

## Copy (verbatim)

- Headline: **What are you working toward?**
- Goal placeholder: **e.g. Finish my essay**
- Section label: **Break it into actions you can actually do**
- Helper: **Small efforts add up — describe each one by what you'll do, not the finish line.**
- Tabs: **By effort** / **By outcome**
- Button: **Next**

## Interaction

- Tapping a template chip adds that action to the list.
- "+ Write my own" opens a small inline text field; submitting adds a custom action.
- The pre-seeded worked example is present on load and removable.
- Store `goalName` and an `actions[]` array (each action: `{ id, label, source: 'effort'|'outcome'|'custom' }`) in state.
- Reaching the screen with the "By effort" tab pre-selected is mandatory.

## Research note (this is your credibility evidence)

Pham & Taylor (1999): process/effort framing produces *more actual effort* than outcome framing, not just clearer language. The pre-seeded example is the endowed-progress effect (start from non-zero → higher completion). On camera: *"I made effort templates the default-feeling option because the literature shows process framing outperforms outcome framing on behaviour, and because 'milestone' was the exact word P3 couldn't make sense of."*

## Out of scope

No deadline picker here (cadence is the next screen). No supporter prompt here (that's Screen 04). Keep this screen about *what effort, broken down how*.
