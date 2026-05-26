# Screen 04 — Offered Social Setup  *(SKIPPABLE — Spec 4)*

**Specs:** Spec 4 (role-aware visibility) · **Theme 2** · **Success criterion 4**
**Routes to:** Screen 05 (Recognition) — whether the user adds someone OR skips.

---

## Purpose

The "huddle" is Huddel's identity, so the social layer stays present — but for the ambivalent socialiser it must be **offered, never demanded**. This screen lets the user optionally add a supporter using **plain-language role presets** (so P1's manager-vs-friend distinction is expressible without privacy jargon), and lets them **skip in one tap**. The skip is not a failure path — choosing to skip *is* the ambivalent-socialiser behaviour, and it's good demo material.

**Design discipline: this is ONE screen. It supports the planning spine; it does not compete with it. Do not expand it into a multi-step invite wizard.**

## Layout (top → bottom)

1. **Gelica headline** (~28px): `Want someone in your corner?`
2. **Inter subhead** (Body Gray): `Adding people is optional — and you choose exactly what they see. You can do this any time later.`
3. **Avatar-group decorative element** (overlapping circles) to evoke the huddle warmly.
4. **Add-supporter row:** a single input (`Name or contact`) + a **role preset selector** (chips, single-select):
   - `Close peer` (sees everything)
   - `Family` (sees progress, not the struggles)
   - `Study friend` (sees this goal only)
   - `Work — availability only` (sees that you're busy, not what you're working on)
   - Under the selected chip, show a one-line plain-language description of what that person will see (text above in parentheses). This *is* Spec 4 — visibility expressed as a relationship, not a toggle.
5. **Secondary action:** `Add` (adds the person to a small list; can add 1–2 for the demo).
6. **TWO bottom actions, both clearly visible:**
   - **Primary pill:** `Done — continue` (enabled whether or not anyone was added)
   - **Skip (equally visible, not greyed or hidden):** `Skip for now`

## Copy (verbatim)

- Headline: **Want someone in your corner?**
- Subhead: **Adding people is optional — and you choose exactly what they see. You can do this any time later.**
- Role presets: **Close peer** / **Family** / **Study friend** / **Work — availability only**
- Buttons: **Add** · **Done — continue** · **Skip for now**

## Interaction

- Role chip selection updates the visibility description line live.
- "Add" pushes `{ name, role }` to a `supporters[]` array in state.
- **Both "Done — continue" and "Skip for now" route to Screen 05.** Skipping leaves `supporters[]` empty — that is a valid, complete state. Never block progress here.

## Research note

This operationalises the ambivalent-socialiser insight from your A2 findings: controlled exposure, not no exposure. Plain-language roles instead of a permissions matrix is the Spec 4 move. On camera, the skip is worth naming: *"Skipping is a designed-for outcome — ambivalence about who sees your goals is exactly the behaviour the research predicts."*

## Out of scope

No contact-list import, no real invitations sent, no notification config. Names are typed for the demo. Do not build a full address-book picker.
