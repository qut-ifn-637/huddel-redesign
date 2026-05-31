# Design Improvements — Usability Test Findings

**Participant:** P1 (returning user, previously tested Huddel v1)
**Date:** Session transcript, prototype v2

---

## 1. Actions feature — insufficient onboarding explanation

**Severity:** High — caused the most notable confusion in the session.

The participant did not initially understand that goals break down into milestones, which then break down into actions. They expected pressing a button to immediately create a milestone, and the layered hierarchy wasn't obvious without the interviewer stepping in to explain.

> "I thought just pressing one it would just make it a milestone… it could have had a bit more like a prompt on how to do it or like an instruction." (04:17, 19:42)

**Proposed improvements:**
- Add a brief inline explainer or tooltip on first use: "Goals → Milestones → Actions. Break each milestone into small, completable steps."
- Show an animated or illustrated example during the goal-creation onboarding rather than leaving the structure to be discovered.
- Consider a guided step-by-step wizard for first-time goal setup: prompt for goal → prompt for milestones → prompt for actions, with a "Next" button at each stage and a skip option for experienced users.

---

## 2. "Repeat" button — ambiguous label

**Severity:** Medium — created momentary confusion that required correction.

The participant interpreted "repeat" as doing the action more than once in a single day, not as marking an action as recurring/schedulable.

> "I thought it was like repeating the goal like more than once a day not repeating it actually like this." (09:25)

**Proposed improvements:**
- Rename to "Make recurring" or "Set schedule" with a calendar/cycle icon.
- On tap, show a bottom sheet that makes the intent explicit: "How often do you want to repeat this action? Daily / Weekly / Custom."

---

## 3. Goal structure — enforced sequential ordering

**Severity:** Medium — identified from comparison with the previous version.

In Huddel v1 the participant felt forced to complete milestones in a strict order and had to know every step upfront before starting. While the prototype partially addressed this, the underlying concern about flexibility was still present.

> "I need to complete the goal before it in order to complete the next goal… the situation might change a lot." (01:08, 01:38)

**Proposed improvements:**
- Allow milestones and actions to be completed in any order by default.
- Add an optional "Ordered" toggle for users who want a strict sequence.
- Allow adding new milestones or actions after a goal is already in progress — avoid locking the structure at creation time.

---

## 4. Onboarding flow — not guided or conversational enough

**Severity:** Medium — participant's top-priority change request.

The participant wanted the goal setup to feel like a guided conversation rather than an open-ended form. They described wanting the app to prompt them through each layer sequentially.

> "Maybe just start efficient and flowing — like it pop up as 'what's your goal?' and then after you set your goal it would have a drop-down menu, 'now time to like break down your goal, what are some actions you can set up?'" (20:21)

**Proposed improvements:**
- Replace the current all-at-once form with a linear wizard: one screen/step per concept (goal → milestone → action), each with a clear "Next" call-to-action.
- Offer two entry modes: **Quick** (structured form) and **Guided** (conversational step-by-step), so different user preferences are accommodated.
- Use affirming micro-copy at each step ("Great! Now let's break that down further.") to make the flow feel less clinical.

---

## 5. Visual design — too plain and formal

**Severity:** Medium — participant mentioned it unprompted and cited it as a barrier to daily engagement.

The current prototype reads as functional but not inviting. The participant used words like "plain," "formal," and "not attractive to the eye," and compared it unfavourably to apps they open voluntarily each day.

> "It's very formal… more colours… you could customise your own colours, customise where it goes, have little widgets to remind you." (21:57, 22:11)

**Proposed improvements:**
- Introduce a richer colour palette — at minimum, allow users to choose an accent colour or theme on first launch.
- Add subtle visual rewards on milestone/action completion (confetti, animated checkmark, streak indicator) to make progress feel tangible and celebratory.
- Design a more engaging home/dashboard screen — something with personality (e.g. a daily greeting, progress ring, motivational nudge) rather than a plain list.
- Consider home-screen widget support as a future roadmap item — multiple users across sessions mentioned this.

---

## 6. Supporter social layer — extend toward shared goals

**Severity:** Low-Medium — desirable enhancement, not a blocking issue.

The participant found the supporter feature motivating but wanted to go further: rather than just watching someone else's goal, they envisioned co-owning a goal with another person.

> "Yeah, a shared goal… it's really useful to see how… if we have any questions about a certain goal that we're both on, it can really help." (10:56, 10:46)

**Proposed improvements:**
- Add a "Shared goal" mode where two or more users both track progress against the same goal and can see each other's actions.
- This is distinct from the existing supporter relationship — both parties are owners, not an owner and an observer.
- Keep this behind a clear opt-in to protect users who want private goals.

---

## 7. Rewards system — user-defined and supporter-set

**Severity:** Low-Medium — unprompted suggestion, shows unmet motivational need.

The participant recalled rewards from Huddel v1 but wanted them expanded to include self-set completion rewards and rewards that supporters can pledge.

> "Rewards that supporters could set up, or rewards you could set for yourself as like an own-reward system… a menu where it's like rewards for finishing this goal." (24:11, 24:25)

**Proposed improvements:**
- On goal creation, add an optional "Reward" field: "What will you treat yourself to when this is done?"
- Allow supporters (with "Everything" access) to pledge a reward visible to the goal owner, reinforcing accountability and external motivation.
- Display the reward prominently on the goal detail screen as a persistent reminder of what they're working toward.

---

## 8. Supporter privacy tiers — well received, reinforce discoverability

**Severity:** Low — positive finding, action is to preserve and clarify.

The three privacy tiers (Everything / Progress / Visibility) resonated clearly once explained. The participant mapped each tier to a real relationship type (accountability buddy, general supporter, private user).

> "These three different types are really helpful depending on what the goals are." (14:41)

**Proposed improvements:**
- Make the tier descriptions more concrete at the point of selection — show a one-line example of what each tier reveals: "Everything — they see missed milestones and can check in on you."
- Consider a brief illustration or icon set for each tier to reduce reading load.

---

## 9. Bottom navigation — validated, keep as-is

The participant explicitly preferred the bottom tab bar over the hamburger menu in Huddel v1 ("very clear different sections, very easy to use"). No changes recommended — this is a confirmed UX win.

---

## Summary priority table

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Actions onboarding explanation | High | Medium |
| 2 | "Repeat" button label ambiguity | Medium | Low |
| 3 | Sequential goal ordering too rigid | Medium | High |
| 4 | Goal setup wizard / guided flow | Medium | High |
| 5 | Visual design — too plain | Medium | High |
| 6 | Shared goals (co-ownership) | Low-Medium | High |
| 7 | User-defined and supporter rewards | Low-Medium | Medium |
| 8 | Privacy tier descriptions clearer | Low | Low |
