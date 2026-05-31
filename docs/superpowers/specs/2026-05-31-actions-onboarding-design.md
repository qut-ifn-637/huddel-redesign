# Actions Onboarding — Design Spec

**Date:** 2026-05-31
**Improvement:** #1 from usability test findings (High severity)
**File:** `docs/design-improvements.md` — "Actions feature — insufficient onboarding explanation"
**Affects:** `src/screens/GoalActions.jsx`, `src/screens/GoalActions.module.css`

---

## Problem

During usability testing, the participant did not understand that goals break into milestones, which break into actions. They expected pressing a button to immediately create a milestone, and needed the interviewer to intervene and explain the hierarchy. The participant's own words:

> "It could have had a bit more like a prompt on how to do it or like an instruction." (19:42)

The GoalActions screen currently shows no explanation of the two-level structure before asking the user to start filling it in.

---

## Decision

**Keep the two-level structure (milestone → actions), fix the explanation.**

A pre-seeded example milestone is added to the milestone list. It is visually distinct from real milestones (dashed border, purple tint, greyed text) and labelled clearly as an example. The user dismisses it with ✕ when ready to add their own.

Rejected alternatives:
- **Collapse to one level** — removes power the existing users rely on; not justified by a single confusion incident
- **Separate explainer card** — adds reading overhead before the user can start; the pre-seeded approach shows rather than tells
- **Collapsible banner** — extra tap to see the example; adds interaction without benefit

---

## Design

### Helper text (always visible)

A helper line is added beneath the screen heading and persists even after the example is dismissed:

> *"Each milestone is a big step toward your goal. Add the actions you'll actually do inside it."*

This is the minimal always-present anchor that orients a returning user who has already dismissed the example.

### Example milestone (session-visible, dismissible)

A pre-seeded milestone card rendered above the real milestone list. Controlled by `showExample` (useState, default `true`). Dismissed with ✕, removed immediately from the DOM (no fade — `{showExample && ...}` conditional render). Reappears on page refresh (session-only, no localStorage).

**Visual treatment:**
- Border: 1.5px dashed, purple (`#b8a8f0`)
- Background: purple-tinted white (`#f8f7ff`)
- Name and action text: grey (`#aaa`, `#bbb`) — passive, illustrative
- Label: `Example — tap ✕ to remove` (9px, uppercase, purple, `#8060dd`)
- Dismiss button: ✕, top-right, `#bbb`, no background

**Content (hardcoded student scenario):**
```
Milestone name:  Write the literature review
Actions:
  • Read 2 papers
  • Write 400 words
  • Draft intro paragraph
```

Effort-based framing chosen deliberately to reinforce the `specs/02_goal_and_actions.md` design claim that effort language outperforms outcome language (Pham & Taylor, 1999).

### canAdvance guard

The existing guard `allActions(milestones).length > 0` is unchanged. The example milestone lives in component state (`showExample`), not in the `milestones` array, so it never satisfies the guard. The `Next` button remains disabled until the user adds at least one real milestone with at least one action.

---

## Scope

**In scope:**
- `GoalActions.jsx` — add `showExample` state, conditional example block, updated helper text
- `GoalActions.module.css` — add example milestone styles and dismiss button styles

**Out of scope:**
- No changes to `MilestoneCard`, `AppContext`, routing, or any other screen
- No localStorage persistence
- No dismiss animation — instant DOM removal via conditional render

---

## Implementation notes

### `GoalActions.jsx` changes

1. Add at top of component:
   ```js
   const [showExample, setShowExample] = useState(true)
   ```

2. Add helper text line beneath the heading (always rendered):
   ```jsx
   <p className={styles.helper}>
     Each milestone is a big step toward your goal. Add the actions you'll actually do inside it.
   </p>
   ```

3. Render example block conditionally above the milestones list:
   ```jsx
   {showExample && (
     <div className={styles.exampleMilestone}>
       <div className={styles.exampleTop}>
         <span className={styles.exampleLabel}>Example — tap ✕ to remove</span>
         <button
           type="button"
           className={styles.dismissBtn}
           onClick={() => setShowExample(false)}
           aria-label="Dismiss example"
         >✕</button>
       </div>
       <p className={styles.exampleName}>Write the literature review</p>
       <hr className={styles.exampleDivider} />
       <p className={styles.exampleAction}>Read 2 papers</p>
       <p className={styles.exampleAction}>Write 400 words</p>
       <p className={styles.exampleAction}>Draft intro paragraph</p>
     </div>
   )}
   ```

### `GoalActions.module.css` changes

```css
.exampleMilestone {
  border: 1.5px dashed #b8a8f0;
  background: #f8f7ff;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  position: relative;
}

.exampleTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.exampleLabel {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8060dd;
}

.dismissBtn {
  background: none;
  border: none;
  font-size: 13px;
  color: #bbb;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.exampleName {
  font-size: 12px;
  font-weight: 600;
  color: #aaa;
  margin: 0 0 6px;
}

.exampleDivider {
  border: none;
  border-top: 1px solid #e8e4ff;
  margin: 6px 0;
}

.exampleAction {
  font-size: 11px;
  color: #bbb;
  margin: 0 0 4px;
  padding-left: 12px;
}

.exampleAction::before {
  content: '•';
  margin-right: 6px;
  color: #c8bbff;
}
```
