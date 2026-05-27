# Repeated vs One-Off Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distinguish repeating effort actions (default, gentle "done N×" tally) from one-off actions (reversible single tick), with undo, honoring rule #2 (no streaks/points/pressure).

**Architecture:** Replace each action's `completed` boolean with a `count` integer plus a `kind` (`'repeat' | 'once'`); `done` is derived as `count > 0`. Authoring (`GoalActions` + `MilestoneCard`) sets `kind` via a per-action "Repeats ⇄ Just once" toggle. `CompleteControl` renders the tally + undo and behaves per kind. `Recognition` and `ReturnView` increment/decrement counts.

**Tech Stack:** React 18, Vite 5, CSS Modules, Vitest + @testing-library/react (jsdom). CSS modules are unhashed in tests (`generateScopedName: '[local]'`), so `toHaveClass('completed')` matches literal class names.

**Branch note:** Per standing consent this session, commit directly to `main`.

**Spec:** `docs/superpowers/specs/2026-05-27-repeat-vs-one-off-actions-design.md`

---

## File Structure

- `src/components/CompleteControl.jsx` + `.module.css` — completion control: tick driven by `count > 0`; repeat shows "done N×" + a "−" undo; once is a reversible toggle. (Task 2)
- `src/components/components.test.jsx` — CompleteControl unit tests migrated to the new interface. (Task 2)
- `src/components/MilestoneCard.jsx` + `.module.css` + `.test.jsx` — per-action "Repeats/Just once" toggle. (Task 1)
- `src/screens/GoalActions.jsx` + `.test.jsx` — action creation shape (`kind:'repeat', count:0`) + `toggleKind`. (Task 1)
- `src/screens/Recognition.jsx` + `.test.jsx` — increment/decrement counts; `completedAny` latches. (Task 2)
- `src/screens/ReturnView.jsx` + `.test.jsx` — increment/decrement; progress + per-milestone counts key on `count > 0`. (Task 2)

`src/context/AppContext.jsx` is untouched (its seed milestone has `actions: []`).

**Sequencing for green-between-tasks:** Task 1 only changes authoring; `Recognition`/`ReturnView`/`CompleteControl` and their tests still use `completed` and stay green. Task 2 migrates `CompleteControl` and both completion screens together (their tests would break if split), ending fully green.

---

## Task 1: Authoring — default-repeat + "Just once" toggle

**Files:**
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/components/MilestoneCard.jsx`
- Modify: `src/components/MilestoneCard.module.css`
- Test: `src/components/MilestoneCard.test.jsx`
- Test: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Update MilestoneCard tests (failing) — kind toggle + fixtures**

In `src/components/MilestoneCard.test.jsx`: (a) give `filledMilestone`'s action a `kind` and drop `completed`; (b) add `onToggleKind: noop` to `renderCard` defaults; (c) add two tests. Replace the `filledMilestone` constant and the `renderCard` props object, and append the new tests:

```jsx
const filledMilestone = {
  id: 'm1',
  name: 'Research',
  actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', kind: 'repeat', count: 0 }],
}
```

```jsx
function renderCard(overrides = {}) {
  const props = {
    milestone: emptyMilestone,
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    onToggleKind: noop,
    ...overrides,
  }
  return render(<MilestoneCard {...props} />)
}
```

Append:

```jsx
test('an action shows a Repeats toggle that calls onToggleKind', async () => {
  const onToggleKind = vi.fn()
  renderCard({ milestone: filledMilestone, expanded: true, onToggleKind })
  await userEvent.click(screen.getByRole('button', { name: /repeats, tap to make it one-off/i }))
  expect(onToggleKind).toHaveBeenCalledWith('a1')
})

test('a one-off action shows the "Just once" label', () => {
  const once = {
    ...filledMilestone,
    actions: [{ id: 'a1', label: 'Submit draft', source: 'effort', kind: 'once', count: 0 }],
  }
  renderCard({ milestone: once, expanded: true })
  expect(screen.getByText('Just once')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run MilestoneCard tests to verify the new ones fail**

Run: `npm test -- src/components/MilestoneCard.test.jsx`
Expected: the two new tests FAIL (no "Repeats"/"Just once" toggle rendered yet); the rest still pass.

- [ ] **Step 3: Add the kind toggle to MilestoneCard**

In `src/components/MilestoneCard.jsx`: add `onToggleKind` to the destructured props, and insert a toggle button in the action `<li>` between the label span and the remove button:

```jsx
export default function MilestoneCard({ milestone, expanded, onToggle, onRename, onAddAction, onRemoveAction, onToggleKind }) {
```

```jsx
              {milestone.actions.map(action => (
                <li key={action.id} className={styles.actionItem}>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <button
                    type="button"
                    className={styles.kindToggle}
                    onClick={() => onToggleKind(action.id)}
                    aria-label={
                      action.kind === 'once'
                        ? `${action.label}: one-off, tap to make it repeat`
                        : `${action.label}: repeats, tap to make it one-off`
                    }
                  >
                    {action.kind === 'once' ? 'Just once' : 'Repeats'}
                  </button>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemoveAction(action.id)}
                    aria-label={`Remove ${action.label}`}
                  >
                    ×
                  </button>
                </li>
              ))}
```

- [ ] **Step 4: Add the `.kindToggle` style**

In `src/components/MilestoneCard.module.css`, append:

```css
.kindToggle {
  flex-shrink: 0;
  background: var(--color-beige);
  border: 1px solid #e6e0ff;
  border-radius: 999px;
  color: var(--color-purple);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  cursor: pointer;
  white-space: nowrap;
}
```

- [ ] **Step 5: Run MilestoneCard tests to verify they pass**

Run: `npm test -- src/components/MilestoneCard.test.jsx`
Expected: PASS (all).

- [ ] **Step 6: Update GoalActions — action shape + toggleKind (with test)**

First add a test in `src/screens/GoalActions.test.jsx` (append):

```jsx
test('a newly added action defaults to repeating', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(screen.getByText('Repeats')).toBeInTheDocument()
})
```

Then in `src/screens/GoalActions.jsx`: change `addAction` to create `kind`/`count`, and add `toggleKind`, and pass `onToggleKind` to `MilestoneCard`:

```jsx
  function addAction(milestoneId, label, source) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: [...m.actions, { id: `act-${nextAction++}`, label, source, kind: 'repeat', count: 0 }],
    }))
  }

  function toggleKind(milestoneId, actionId) {
    updateMilestone(milestoneId, m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, kind: a.kind === 'once' ? 'repeat' : 'once' } : a)),
    }))
  }
```

```jsx
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            expanded={expandedId === milestone.id}
            onToggle={() => toggleMilestone(milestone.id)}
            onRename={name => renameMilestone(milestone.id, name)}
            onAddAction={(label, source) => addAction(milestone.id, label, source)}
            onRemoveAction={actionId => removeAction(milestone.id, actionId)}
            onToggleKind={actionId => toggleKind(milestone.id, actionId)}
          />
```

- [ ] **Step 7: Run the full suite to verify green**

Run: `npm test`
Expected: PASS (all files). `Recognition`/`ReturnView`/`CompleteControl` are untouched and still use `completed`, so they remain green.

- [ ] **Step 8: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.test.jsx src/components/MilestoneCard.jsx src/components/MilestoneCard.module.css src/components/MilestoneCard.test.jsx
git commit -m "feat: add repeat/one-off action kind with Just-once toggle"
```

---

## Task 2: Completion rework — count, "done N×" tally, and undo

**Files:**
- Modify: `src/components/CompleteControl.jsx`
- Modify: `src/components/CompleteControl.module.css`
- Test: `src/components/components.test.jsx`
- Modify: `src/screens/Recognition.jsx`
- Test: `src/screens/Recognition.test.jsx`
- Modify: `src/screens/ReturnView.jsx`
- Test: `src/screens/ReturnView.test.jsx`

> Note on `repeatable`: both screens compute `repeatable={action.kind !== 'once'}` so a default/undefined `kind` counts as repeating (matches the default-repeat decision). This is equivalent to `=== 'repeat'` for created/seeded actions, which always carry an explicit `kind`.

- [ ] **Step 1: Replace the CompleteControl tests with the new interface (failing)**

In `src/components/components.test.jsx`, replace the entire CompleteControl section (the `import CompleteControl ...` line and every `CompleteControl` test after it) with:

```jsx
import CompleteControl from './CompleteControl'

// CompleteControl
test('CompleteControl renders the action label', () => {
  render(<CompleteControl actionId="a1" label="Write 400 words" count={0} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('repeatable: tapping calls onComplete with actionId', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" count={0} repeatable onComplete={onComplete} onUndo={() => {}} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).toHaveBeenCalledWith('a1')
})

test('repeatable with count > 0 shows "done N×" and an undo that calls onUndo only', async () => {
  const onComplete = vi.fn()
  const onUndo = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" count={3} repeatable onComplete={onComplete} onUndo={onUndo} />)
  expect(screen.getByText(/done 3×/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /undo one/i }))
  expect(onUndo).toHaveBeenCalledWith('a1')
  expect(onComplete).not.toHaveBeenCalled()
})

test('one-off: first tap completes, tap when done undoes (toggle)', async () => {
  const onComplete = vi.fn()
  const onUndo = vi.fn()
  const { rerender } = render(<CompleteControl actionId="a1" label="Submit draft" count={0} repeatable={false} onComplete={onComplete} onUndo={onUndo} />)
  await userEvent.click(screen.getByText('Submit draft'))
  expect(onComplete).toHaveBeenCalledWith('a1')
  rerender(<CompleteControl actionId="a1" label="Submit draft" count={1} repeatable={false} onComplete={onComplete} onUndo={onUndo} />)
  await userEvent.click(screen.getByText('Submit draft'))
  expect(onUndo).toHaveBeenCalledWith('a1')
})

test('CompleteControl has completed class on the circle when count > 0', () => {
  render(<CompleteControl actionId="a1" label="done" count={1} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByTestId('complete-circle')).toHaveClass('completed')
})

test('a finished one-off is struck through; a repeat is not', () => {
  const { rerender } = render(<CompleteControl actionId="a1" label="Submit draft" count={1} repeatable={false} onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Submit draft')).toHaveClass('labelDone')
  rerender(<CompleteControl actionId="a2" label="Write 400 words" count={1} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Write 400 words')).not.toHaveClass('labelDone')
})
```

- [ ] **Step 2: Run CompleteControl tests to verify they fail**

Run: `npm test -- src/components/components.test.jsx`
Expected: the new CompleteControl tests FAIL (old component ignores `count`/`repeatable`/`onUndo`).

- [ ] **Step 3: Rewrite CompleteControl.jsx**

Replace the entire file `src/components/CompleteControl.jsx`:

```jsx
import styles from './CompleteControl.module.css'

export default function CompleteControl({ actionId, label, count, repeatable, onComplete, onUndo }) {
  const done = count > 0

  function handlePrimary() {
    if (repeatable) onComplete(actionId)
    else if (done) onUndo(actionId)
    else onComplete(actionId)
  }

  const ariaLabel = done
    ? `${label} — done${repeatable ? `, ${count} times` : ''}`
    : `Mark done: ${label}`

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.main}
        onClick={handlePrimary}
        role="button"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePrimary() } }}
      >
        <div
          data-testid="complete-circle"
          className={`${styles.circle} ${done ? styles.completed : ''}`}
        >
          {done && (
            <svg viewBox="0 0 24 24" className={styles.check} aria-hidden="true">
              <polyline points="4,13 9,18 20,6" />
            </svg>
          )}
        </div>
        <span className={`${styles.label} ${done && !repeatable ? styles.labelDone : ''}`}>
          {label}
        </span>
        {repeatable && done && <span className={styles.count}>done {count}×</span>}
      </div>
      {repeatable && done && (
        <button
          type="button"
          className={styles.undo}
          onClick={() => onUndo(actionId)}
          aria-label="Undo one"
        >
          −
        </button>
      )}
    </div>
  )
}
```

(The "−" glyph is the minus sign U+2212; the "×" in "done {count}×" is the multiplication sign U+00D7.)

- [ ] **Step 4: Rewrite CompleteControl.module.css**

Replace the entire file `src/components/CompleteControl.module.css`:

```css
.wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 20px;
  background: var(--color-beige);
  border-radius: var(--radius-card);
  user-select: none;
}

.main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.circle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.completed {
  background: var(--color-success-green);
  border-color: var(--color-success-green);
}

.check {
  width: 15px;
  height: 15px;
  stroke: white;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 32;
  stroke-dashoffset: 32;
  animation: drawCheck 0.15s ease forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

.label {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-black);
  flex: 1;
  min-width: 0;
}

.labelDone {
  color: var(--color-body-gray);
  text-decoration: line-through;
}

.count {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-body-gray);
}

.undo {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #ddd;
  background: none;
  color: var(--color-body-gray);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
```

- [ ] **Step 5: Run CompleteControl tests to verify they pass**

Run: `npm test -- src/components/components.test.jsx`
Expected: PASS. (The `Recognition`/`ReturnView` suites are now temporarily RED because they still pass `completed`; they are fixed in the next steps.)

- [ ] **Step 6: Migrate Recognition test seeds + click queries**

In `src/screens/Recognition.test.jsx`: (a) in `seedState`, replace each action's `completed: false` with `kind: 'repeat', count: 0`; (b) in the "single unnamed milestone" `flat` fixture, same replacement; (c) change the three completion-click queries from `/mark complete: .../i` to `/mark done: .../i`. The updated seed and queries:

```jsx
const seedState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'm1', name: 'Research', actions: [
      { id: 'a1', label: 'Read 3 sources', source: 'effort', kind: 'repeat', count: 0 },
      { id: 'a2', label: 'Take notes', source: 'effort', kind: 'repeat', count: 0 },
    ]},
    { id: 'm2', name: 'Draft', actions: [
      { id: 'a3', label: 'Write 400 words', source: 'effort', kind: 'repeat', count: 0 },
    ]},
  ],
  cadence: 'few_times_week',
}
```

The `flat` fixture action becomes `{ id: 'a1', label: 'Read 3 sources', source: 'effort', kind: 'repeat', count: 0 }`. The three `fireEvent.click(screen.getByRole('button', { name: /mark complete: <label>/i }))` lines become `/mark done: <label>/i` (preserving each label: `read 3 sources`, `write 400 words`, `read 3 sources`).

- [ ] **Step 7: Rewrite Recognition.jsx to use counts**

Replace the body of `src/screens/Recognition.jsx` (keep the imports). The changed parts are the handlers and the `CompleteControl` props:

```jsx
export default function Recognition() {
  const { state, updateState, goTo, goBack } = useApp()
  const [milestones, setMilestones] = useState(state.milestones)
  const [completedAny, setCompletedAny] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  function applyCount(actionId, fn) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, count: fn(a) } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  function handleComplete(actionId) {
    applyCount(actionId, a => (a.kind === 'once' ? 1 : (a.count || 0) + 1))
    if (!completedAny) {
      setCompletedAny(true)
      setTimeout(() => setShowContinue(true), 1500)
    }
  }

  function handleUndo(actionId) {
    applyCount(actionId, a => Math.max(0, (a.count || 0) - 1))
  }

  const showHeaders = milestones.length > 1 || milestones.some(m => m.name.trim())
  const continueLabel = state.cadence === 'when_i_can'
    ? 'See your home base →'
    : 'See what tomorrow looks like →'

  return (
    <div className="screenPad">
      <BackButton onClick={goBack} />
      <h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>

      <div className={styles.milestones}>
        {milestones.map((milestone, i) => (
          <div key={milestone.id} className={styles.milestoneGroup}>
            {showHeaders && (
              <div className={styles.milestoneHeader}>
                {milestone.name.trim() || `Milestone ${i + 1}`}
              </div>
            )}
            <div className={styles.actionList}>
              {milestone.actions.map(action => (
                <CompleteControl
                  key={action.id}
                  actionId={action.id}
                  label={action.label}
                  count={action.count || 0}
                  repeatable={action.kind !== 'once'}
                  onComplete={handleComplete}
                  onUndo={handleUndo}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.helper}>
        Tap one to mark it done — this is the move you&apos;ll come back for.
      </p>

      {completedAny && (
        <div className={styles.peakMessage}>
          That&apos;s one done. This is how progress adds up.
        </div>
      )}

      {completedAny && (
        <p className="scienceNote">Finishing one small action builds the confidence that drives the next. — Bandura &amp; Schunk, 1981</p>
      )}

      <div className="bottomActions">
        {showContinue && (
          <PrimaryButton onClick={() => goTo('return-view')}>
            {continueLabel}
          </PrimaryButton>
        )}
        <SkipButton onClick={() => goTo('return-view')}>Skip for now</SkipButton>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run Recognition tests to verify they pass**

Run: `npm test -- src/screens/Recognition.test.jsx`
Expected: PASS (all).

- [ ] **Step 9: Migrate ReturnView test seeds + add new tests**

In `src/screens/ReturnView.test.jsx`: (a) replace `baseState` actions' `completed` with `kind`/`count`; (b) append three new tests. Updated `baseState`:

```jsx
const baseState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', kind: 'repeat', count: 1 },
      { id: 'act-2',  label: 'Read for 30 min',  source: 'effort', kind: 'repeat', count: 0 },
    ]},
  ],
  cadence: 'few_times_week',
  supporters: [],
}
```

Append:

```jsx
test('a repeating action shows a "done N×" tally and an undo control', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/done 1×/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /undo one/i })).toBeInTheDocument()
})

test('tapping a not-yet-done repeating action increments the progress count', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  await userEvent.click(screen.getByRole('button', { name: /mark done: read for 30 min/i }))
  expect(screen.getByText(/2 actions done · keep it rolling/)).toBeInTheDocument()
})

test('a one-off action toggles done and back via the circle', async () => {
  const once = {
    ...baseState,
    milestones: [{ id: 'milestone-1', name: '', actions: [
      { id: 'o1', label: 'Submit draft', source: 'effort', kind: 'once', count: 0 },
    ]}],
  }
  renderWithApp(<ReturnView />, { initialStateOverrides: once })
  await userEvent.click(screen.getByRole('button', { name: /submit draft/i }))
  expect(screen.getByText(/1 action done · keep it rolling/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /submit draft/i }))
  expect(screen.getByText(/0 actions done · keep it rolling/)).toBeInTheDocument()
})
```

- [ ] **Step 10: Rewrite ReturnView.jsx to use counts**

In `src/screens/ReturnView.jsx`: change the derived counts, add `handleUndo`, make `handleComplete` increment kind-aware, change per-milestone `done`, and update `CompleteControl` props. The changed lines:

```jsx
  const flat = allActions(milestones)
  const completedCount = flat.filter(a => a.count > 0).length
  const allDone = flat.length > 0 && completedCount === flat.length
  const isWhenICan = state.cadence === 'when_i_can'
```

```jsx
  function applyCount(actionId, fn) {
    const updated = milestones.map(m => ({
      ...m,
      actions: m.actions.map(a => (a.id === actionId ? { ...a, count: fn(a) } : a)),
    }))
    setMilestones(updated)
    updateState({ milestones: updated })
  }

  function handleComplete(actionId) {
    applyCount(actionId, a => (a.kind === 'once' ? 1 : (a.count || 0) + 1))
  }

  function handleUndo(actionId) {
    applyCount(actionId, a => Math.max(0, (a.count || 0) - 1))
  }
```

```jsx
        {milestones.map((milestone, i) => {
          const done = milestone.actions.filter(a => a.count > 0).length
          return (
            <div key={milestone.id} className={styles.stepGroup}>
              {showHeaders && (
                <div className={styles.stepHeader}>
                  <span>{milestone.name.trim() || `Milestone ${i + 1}`}</span>
                  <span className={styles.stepCount}>{done}/{milestone.actions.length}</span>
                </div>
              )}
              <div className={styles.actionList}>
                {milestone.actions.map(action => (
                  <CompleteControl
                    key={action.id}
                    actionId={action.id}
                    label={action.label}
                    count={action.count || 0}
                    repeatable={action.kind !== 'once'}
                    onComplete={handleComplete}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            </div>
          )
        })}
```

- [ ] **Step 11: Run ReturnView tests to verify they pass**

Run: `npm test -- src/screens/ReturnView.test.jsx`
Expected: PASS (all).

- [ ] **Step 12: Run the full suite to verify green**

Run: `npm test`
Expected: PASS (all files).

- [ ] **Step 13: Commit**

```bash
git add src/components/CompleteControl.jsx src/components/CompleteControl.module.css src/components/components.test.jsx src/screens/Recognition.jsx src/screens/Recognition.test.jsx src/screens/ReturnView.jsx src/screens/ReturnView.test.jsx
git commit -m "feat: model action completion as a count with reflective tally and undo"
```

---

## Task 3: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 2: Build to catch any integration error**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Manual smoke (browser)**

Run `npm run dev`, then walk the flow: goal → milestones (toggle an action to "Just once" and back) → cadence → supporters → Recognition (tap an action; confirm peak; tap the same repeat action again to see "done 2×"; tap "−" to undo) → home base (confirm "done N×" + working "−"; tap a one-off to tick and tap again to untick; confirm the progress count tracks `count > 0`).

---

## Self-Review

**Spec coverage:**
- §2/§3 model (`kind` default `repeat`, `count`, `done = count>0`) → Task 1 (creation shape) + Task 2 (consumption).
- §4 CompleteControl (tick by count, repeat tally + "−" undo, once toggle, strikethrough only for once) → Task 2 Steps 1–5.
- §5 authoring toggle → Task 1.
- §6 ReturnView (increment/decrement, counts key on `count>0`) → Task 2 Steps 9–11.
- §7 Recognition (increment/decrement, `completedAny` latches) → Task 2 Steps 6–8 (`completedAny` set once on first complete, never reset).
- §8 rule-#2 guardrail → muted `.count`, no streak/score UI introduced.
- §9 migration → all `completed` seeds replaced across the three test files; `AppContext` untouched.
- §10 testing → covered in the test steps.

**Placeholder scan:** none.

**Type consistency:** action shape `{ id, label, source, kind, count }` consistent across `GoalActions.addAction`, all seeds, and both screens. `CompleteControl` interface `{ actionId, label, count, repeatable, onComplete, onUndo }` consistent between the component, its tests, and both screens. Handlers `handleComplete`/`handleUndo`/`applyCount` named identically in both screens.
