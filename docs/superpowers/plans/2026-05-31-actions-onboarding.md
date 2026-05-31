# Actions Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pre-seeded example milestone to the GoalActions screen so first-time users immediately understand the milestone → action hierarchy without reading an explanation.

**Architecture:** Two changes to `GoalActions.jsx`: update the existing helper text to describe the hierarchy, and render a session-only example milestone card above the real list controlled by `useState`. The example lives entirely in component state — it never touches the `milestones` array — so the existing `canAdvance` guard and all other behaviour are unchanged. CSS additions to `GoalActions.module.css` style the example as visually distinct (dashed border, purple tint, grey text).

**Tech Stack:** React 18, Vitest, Testing Library (`renderWithApp` from `src/test/helpers.jsx`), CSS Modules

---

### Task 1: Update helper text

The current helper text ("Optional — add as many as help…") describes quantity. Replace it with copy that explains the two-level structure. The `.helper` CSS class already exists.

**Files:**
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Write the failing test**

Add to `src/screens/GoalActions.test.jsx`:

```jsx
test('shows hierarchy helper text beneath the heading', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(
    screen.getByText(/each milestone is a big step toward your goal/i)
  ).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: FAIL — `Unable to find an element with the text: /each milestone is a big step toward your goal/i`

- [ ] **Step 3: Update the helper text in GoalActions.jsx**

Find the existing `<p className={styles.helper}>` line (currently reads "Optional — add as many as help…") and replace its content:

```jsx
<p className={styles.helper}>
  Each milestone is a big step toward your goal. Add the actions you&apos;ll actually do inside it.
</p>
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: all tests PASS (including the pre-existing ones)

- [ ] **Step 5: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.test.jsx
git commit -m "feat: update GoalActions helper text to explain milestone/action hierarchy"
```

---

### Task 2: Add example milestone JSX and state

Add a `showExample` boolean to component state. When true, render a non-interactive example milestone card above the real milestone list. A ✕ button sets `showExample` to false, removing the card for the rest of the session.

**Files:**
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add to `src/screens/GoalActions.test.jsx`:

```jsx
test('shows an example milestone on first render', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText(/example — tap/i)).toBeInTheDocument()
  expect(screen.getByText('Write the literature review')).toBeInTheDocument()
  expect(screen.getByText('Read 2 papers')).toBeInTheDocument()
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
  expect(screen.getByText('Draft intro paragraph')).toBeInTheDocument()
})

test('dismissing the example removes it from the screen', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByRole('button', { name: /dismiss example/i }))
  expect(screen.queryByText('Write the literature review')).not.toBeInTheDocument()
})

test('Next remains disabled while only the example is shown and no real actions exist', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: the three new tests FAIL, all pre-existing tests still PASS

- [ ] **Step 3: Add showExample state and example milestone block to GoalActions.jsx**

At the top of the `GoalActions` function body, after the existing `useState` calls, add:

```jsx
const [showExample, setShowExample] = useState(true)
```

Then, inside the returned JSX, add the example block immediately before the `<div className={styles.milestones}>` element:

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

The full `return` block in `GoalActions.jsx` should now look like this (showing the changed/added lines in context):

```jsx
return (
  <div className="screenPad">
    <BackButton onClick={handleBack} />
    {state.goalName && <p className={styles.eyebrow}>{state.goalName}</p>}
    <h1 className={styles.heading}>Break it into milestones</h1>
    <p className="scienceNote">Near-term milestones build momentum and confidence. — Bandura &amp; Schunk, 1981</p>
    <p className={styles.helper}>
      Each milestone is a big step toward your goal. Add the actions you&apos;ll actually do inside it.
    </p>

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

    <div className={styles.milestones}>
      {milestones.map(milestone => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          expanded={expandedId === milestone.id}
          onToggle={() => toggleMilestone(milestone.id)}
          onRename={name => renameMilestone(milestone.id, name)}
          onAddAction={(label, source) => addAction(milestone.id, label, source)}
          onRemoveAction={actionId => removeAction(milestone.id, actionId)}
          onSetKind={(actionId, kind) => setKind(milestone.id, actionId, kind)}
        />
      ))}
    </div>

    <button type="button" className={styles.addMilestone} onClick={addMilestone}>
      + Add milestone
    </button>

    <div className="bottomActions">
      <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
        Next
      </PrimaryButton>
    </div>
  </div>
)
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.test.jsx
git commit -m "feat: add dismissible example milestone to GoalActions screen"
```

---

### Task 3: Add CSS styles for the example milestone

Style the example block so it reads as non-interactive and clearly distinct from real milestone cards: dashed purple border, purple-tinted background, greyed text.

**Files:**
- Modify: `src/screens/GoalActions.module.css`

- [ ] **Step 1: Append the new classes to GoalActions.module.css**

Add the following to the end of `src/screens/GoalActions.module.css`:

```css
.exampleMilestone {
  border: 1.5px dashed #b8a8f0;
  background: #f8f7ff;
  border-radius: var(--radius-card);
  padding: 10px 12px;
  margin-bottom: var(--space-3);
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

- [ ] **Step 2: Run the full test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/screens/GoalActions.module.css
git commit -m "style: add example milestone card styles to GoalActions"
```
