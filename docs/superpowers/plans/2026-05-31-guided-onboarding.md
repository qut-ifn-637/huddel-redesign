# Guided Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 5-screen onboarding feel guided and conversational by adding a 4-step progress indicator and a consistent warm connective voice — without adding screens, a chat UI, or a persona character.

**Architecture:** A new presentational `OnboardingProgress` component (prop `step`, total hard-coded to 4) renders a dot row + "Step N of 4" label at the top of the four setup screens (GoalSetup=1, GoalActions=2, Cadence=3, OfferedSocial=4). Warm connective copy is added to GoalActions (additive `.greeting` line) and replaces the headings on Cadence and OfferedSocial. Recognition is reframed as a celebratory finale (copy-only, no progress dots). No AppContext or state-shape changes — every change is a static-copy edit or a single prop-only component insertion.

**Tech Stack:** React 18, Vite, CSS Modules, Vitest, Testing Library (`renderWithApp` from `src/test/helpers.jsx`). In the test environment, CSS-module class names resolve to their literal local names (vite.config.js `classNameStrategy: 'non-scoped'`), so tests may assert on `.dot` / `.dotFilled`.

---

### Task 1: Create the `OnboardingProgress` component

A pure, context-free presentational component. Given `step` (1–4), render 4 dots (filled for dots `<= step`) and a "Step N of 4" label.

**Files:**
- Create: `src/components/OnboardingProgress.jsx`
- Create: `src/components/OnboardingProgress.module.css`
- Create: `src/components/OnboardingProgress.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/OnboardingProgress.test.jsx` with exactly this content:

```jsx
import { render, screen } from '@testing-library/react'
import OnboardingProgress from './OnboardingProgress'

test('renders the visible "Step N of 4" label for the given step', () => {
  render(<OnboardingProgress step={2} />)
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
})

test('exposes the step as an accessible label on the container', () => {
  render(<OnboardingProgress step={3} />)
  expect(screen.getByLabelText('Step 3 of 4')).toBeInTheDocument()
})

test('renders four dots total, with `step` of them filled', () => {
  const { container } = render(<OnboardingProgress step={2} />)
  expect(container.querySelectorAll('.dot')).toHaveLength(4)
  expect(container.querySelectorAll('.dotFilled')).toHaveLength(2)
})

test('fills all four dots on the last step', () => {
  const { container } = render(<OnboardingProgress step={4} />)
  expect(container.querySelectorAll('.dotFilled')).toHaveLength(4)
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/OnboardingProgress.test.jsx
```

Expected: FAIL — `Failed to resolve import "./OnboardingProgress"` (the component does not exist yet).

- [ ] **Step 3: Create the component**

Create `src/components/OnboardingProgress.jsx` with exactly this content:

```jsx
import styles from './OnboardingProgress.module.css'

const TOTAL = 4

export default function OnboardingProgress({ step }) {
  return (
    <div className={styles.progress} aria-label={`Step ${step} of ${TOTAL}`}>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i + 1 <= step ? styles.dotFilled : ''}`}
          />
        ))}
      </div>
      <span className={styles.label}>Step {step} of {TOTAL}</span>
    </div>
  )
}
```

- [ ] **Step 4: Create the stylesheet**

Create `src/components/OnboardingProgress.module.css` with exactly this content:

```css
.progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-purple-tint);
}

.dotFilled {
  background: var(--color-purple);
}

.label {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--color-body-gray);
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/components/OnboardingProgress.test.jsx
```

Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/OnboardingProgress.jsx src/components/OnboardingProgress.module.css src/components/OnboardingProgress.test.jsx
git commit -m "feat: add OnboardingProgress step indicator component"
```

---

### Task 2: Add progress (step 1) to GoalSetup

GoalSetup is step 1. It keeps its existing brand, headline, and value-prop subhead — it only gains the progress indicator at the very top. There is no `BackButton` on this screen (it is the first), so the progress sits above the `.brand` div.

**Files:**
- Modify: `src/screens/GoalSetup.jsx`
- Modify: `src/screens/GoalSetup.test.jsx`

- [ ] **Step 1: Write the failing test**

Add this test to the end of `src/screens/GoalSetup.test.jsx`:

```jsx
test('shows the progress indicator on step 1', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/screens/GoalSetup.test.jsx
```

Expected: FAIL — `Unable to find an element with the text: Step 1 of 4`.

- [ ] **Step 3: Add the import to GoalSetup.jsx**

In `src/screens/GoalSetup.jsx`, add the import after the existing `PrimaryButton` import (line 3):

```jsx
import PrimaryButton from '../components/PrimaryButton'
import OnboardingProgress from '../components/OnboardingProgress'
import styles from './GoalSetup.module.css'
```

- [ ] **Step 4: Render the progress indicator at the top of the screen**

In `src/screens/GoalSetup.jsx`, add `<OnboardingProgress step={1} />` as the first child inside the `screenPad` div, immediately above the `.brand` div:

```jsx
  return (
    <div className="screenPad">
      <OnboardingProgress step={1} />
      <div className={styles.brand}>Huddel</div>
      <h1 className={styles.headline}>What goal are you working on?</h1>
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npx vitest run src/screens/GoalSetup.test.jsx
```

Expected: all tests PASS (4 pre-existing + 1 new = 5).

- [ ] **Step 6: Commit**

```bash
git add src/screens/GoalSetup.jsx src/screens/GoalSetup.test.jsx
git commit -m "feat: add step-1 progress indicator to GoalSetup"
```

---

### Task 3: Add progress (step 2) and connective greeting to GoalActions

GoalActions is step 2. It gains the progress indicator at the very top (above the `BackButton`) and a warm `.greeting` line directly below the existing `<h1>` heading and above the science note. The eyebrow (`goalName`), heading, science note, helper, example card, and all logic are unchanged.

**Files:**
- Modify: `src/screens/GoalActions.jsx`
- Modify: `src/screens/GoalActions.module.css`
- Modify: `src/screens/GoalActions.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add these tests to the end of `src/screens/GoalActions.test.jsx`. Note: `seed` is already defined at the top of the file as `const seed = { goalName: 'Finish my essay' }`.

```jsx
test('shows the progress indicator on step 2', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
})

test('shows the connective greeting line', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(
    screen.getByText("Great start — now let's break it into doable steps.")
  ).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: the 2 new tests FAIL (`Step 2 of 4` and the greeting text are not found). All pre-existing tests still PASS.

- [ ] **Step 3: Add the import to GoalActions.jsx**

In `src/screens/GoalActions.jsx`, add the import after the existing `MilestoneCard` import (line 5):

```jsx
import MilestoneCard from '../components/MilestoneCard'
import OnboardingProgress from '../components/OnboardingProgress'
import styles from './GoalActions.module.css'
```

- [ ] **Step 4: Render the progress indicator and greeting**

In `src/screens/GoalActions.jsx`, update the top of the returned JSX. Add `<OnboardingProgress step={2} />` as the first child of `screenPad` (above `BackButton`), and add the `.greeting` paragraph directly below the `<h1>` heading and above the science note:

```jsx
  return (
    <div className="screenPad">
      <OnboardingProgress step={2} />
      <BackButton onClick={handleBack} />
      {state.goalName && <p className={styles.eyebrow}>{state.goalName}</p>}
      <h1 className={styles.heading}>Break it into milestones</h1>
      <p className={styles.greeting}>Great start — now let&apos;s break it into doable steps.</p>
      <p className="scienceNote">Near-term milestones build momentum and confidence. — Bandura &amp; Schunk, 1981</p>
```

Note: in JSX the apostrophe is written `&apos;`; it renders as a real apostrophe, so the test string `"Great start — now let's break it into doable steps."` (with a normal apostrophe) matches.

- [ ] **Step 5: Add the `.greeting` style to GoalActions.module.css**

Append this to the end of `src/screens/GoalActions.module.css`:

```css
.greeting {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-body-gray);
  margin: 0 0 var(--space-3);
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/GoalActions.test.jsx
```

Expected: all tests PASS (14 pre-existing + 2 new = 16).

- [ ] **Step 7: Commit**

```bash
git add src/screens/GoalActions.jsx src/screens/GoalActions.module.css src/screens/GoalActions.test.jsx
git commit -m "feat: add step-2 progress and connective greeting to GoalActions"
```

---

### Task 4: Add progress (step 3) to Cadence and replace its heading with the greeting

Cadence is step 3. It gains the progress indicator above the `BackButton`, and its `<h1>` heading text changes from "How often can you work on this?" to the warmer connective line. The heading keeps its existing `.headline` class (no CSS change). The helper, science note, options, day picker, and reassurance are unchanged.

**Files:**
- Modify: `src/screens/Cadence.jsx`
- Modify: `src/screens/Cadence.test.jsx`

- [ ] **Step 1: Update the heading assertion and add new tests**

In `src/screens/Cadence.test.jsx`, replace the first test (`'renders headline verbatim'`, lines 6–9) with an updated heading assertion, and add two new tests. The replacement block:

```jsx
test('renders the warmer connective heading', () => {
  renderWithApp(<Cadence />)
  expect(
    screen.getByText('Nice work. Now, how often can you realistically work on it?')
  ).toBeInTheDocument()
})

test('no longer shows the old blunt heading', () => {
  renderWithApp(<Cadence />)
  expect(screen.queryByText('How often can you work on this?')).not.toBeInTheDocument()
})

test('shows the progress indicator on step 3', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText('Step 3 of 4')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/Cadence.test.jsx
```

Expected: the 3 changed/new tests FAIL (new heading and `Step 3 of 4` not found; the old-heading negative assertion fails because the old heading is still present). Other tests PASS.

- [ ] **Step 3: Add the import to Cadence.jsx**

In `src/screens/Cadence.jsx`, add the import after the existing `BackButton` import (line 5):

```jsx
import BackButton from '../components/BackButton'
import OnboardingProgress from '../components/OnboardingProgress'
import styles from './Cadence.module.css'
```

- [ ] **Step 4: Render the progress indicator and change the heading text**

In `src/screens/Cadence.jsx`, update the top of the returned JSX. Add `<OnboardingProgress step={3} />` as the first child of `screenPad` (above `BackButton`) and change the `<h1>` text:

```jsx
  return (
    <div className="screenPad">
      <OnboardingProgress step={3} />
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>Nice work. Now, how often can you realistically work on it?</h1>
      <p className={styles.helper}>No wrong answer. You can change this whenever your week changes.</p>
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/Cadence.test.jsx
```

Expected: all tests PASS (9 pre-existing unchanged + 1 replaced heading test + 2 new = 12).

- [ ] **Step 6: Commit**

```bash
git add src/screens/Cadence.jsx src/screens/Cadence.test.jsx
git commit -m "feat: add step-3 progress and warmer heading to Cadence"
```

---

### Task 5: Add progress (step 4) to OfferedSocial and replace its heading with the greeting

OfferedSocial is step 4 (the last setup step). It gains the progress indicator above the `BackButton`, and its `<h1>` heading changes from "Want a supporter in your corner?" to "Almost there — want someone in your corner?" ("Almost there" reinforces that the end is near). The heading keeps its `.headline` class. Subhead, avatars, role chips, add flow, and skip logic are unchanged.

**Files:**
- Modify: `src/screens/OfferedSocial.jsx`
- Modify: `src/screens/OfferedSocial.test.jsx`

- [ ] **Step 1: Update the heading assertion and add new tests**

In `src/screens/OfferedSocial.test.jsx`, replace the first test (`'renders headline verbatim'`, lines 6–9) with an updated heading assertion, and add two new tests. The replacement block:

```jsx
test('renders the warmer connective heading', () => {
  renderWithApp(<OfferedSocial />)
  expect(
    screen.getByText('Almost there — want someone in your corner?')
  ).toBeInTheDocument()
})

test('no longer shows the old heading', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.queryByText('Want a supporter in your corner?')).not.toBeInTheDocument()
})

test('shows the progress indicator on step 4', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/OfferedSocial.test.jsx
```

Expected: the 3 changed/new tests FAIL (new heading and `Step 4 of 4` not found; the old-heading negative assertion fails because the old heading is still present). Other tests PASS.

- [ ] **Step 3: Add the import to OfferedSocial.jsx**

In `src/screens/OfferedSocial.jsx`, add the import after the existing `BackButton` import (line 5):

```jsx
import BackButton from '../components/BackButton'
import OnboardingProgress from '../components/OnboardingProgress'
import { ROLES } from '../data/roles'
```

- [ ] **Step 4: Render the progress indicator and change the heading text**

In `src/screens/OfferedSocial.jsx`, update the top of the returned JSX. Add `<OnboardingProgress step={4} />` as the first child of `screenPad` (above `BackButton`) and change the `<h1>` text:

```jsx
  return (
    <div className="screenPad">
      <OnboardingProgress step={4} />
      <BackButton onClick={handleBack} />
      <h1 className={styles.headline}>Almost there — want someone in your corner?</h1>
      <p className={styles.subhead}>
        Adding people is optional — and you choose exactly what they see. You can do this any time later.
      </p>
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/OfferedSocial.test.jsx
```

Expected: all tests PASS (11 pre-existing unchanged + 1 replaced heading test + 2 new = 14).

- [ ] **Step 6: Commit**

```bash
git add src/screens/OfferedSocial.jsx src/screens/OfferedSocial.test.jsx
git commit -m "feat: add step-4 progress and warmer heading to OfferedSocial"
```

---

### Task 6: Reframe Recognition as the celebratory finale

Recognition is the finale, not a numbered step. It gets a celebratory heading and explicitly does NOT render a progress indicator. Everything else (the complete-control list, peak message, science note, continue/skip buttons, `enterApp` logic) is unchanged.

**Files:**
- Modify: `src/screens/Recognition.jsx`
- Modify: `src/screens/Recognition.test.jsx`

- [ ] **Step 1: Update the heading assertion and add a no-progress test**

In `src/screens/Recognition.test.jsx`, replace the first test (`'renders headline verbatim'`, lines 19–22) with the new heading assertion and add a no-progress test. The replacement block:

```jsx
test('renders the celebratory finale headline', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("🎉 You're all set up! Try it once.")).toBeInTheDocument()
})

test('does not render a progress indicator (it is the finale)', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.queryByText(/Step \d of 4/)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/Recognition.test.jsx
```

Expected: the new headline test FAILS (the celebratory heading is not present yet). The no-progress test PASSES already (Recognition never rendered progress), which is fine — it guards against future regressions.

- [ ] **Step 3: Update the heading in Recognition.jsx**

In `src/screens/Recognition.jsx`, change the `<h1>` (line 44):

```jsx
// Before
<h1 className={styles.headline}>You&apos;re set up. Try it once.</h1>
// After
<h1 className={styles.headline}>🎉 You&apos;re all set up! Try it once.</h1>
```

Do NOT add an `OnboardingProgress` import or element to this screen — the finale has no step dots.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/Recognition.test.jsx
```

Expected: all tests PASS (9 pre-existing unchanged + 1 replaced heading test + 1 new = 11).

- [ ] **Step 5: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: all tests PASS (previous total + 4 OnboardingProgress + 1 GoalSetup + 2 GoalActions + 2 Cadence + 2 OfferedSocial + 1 Recognition new tests; the replaced heading tests are 1:1 swaps).

- [ ] **Step 6: Commit**

```bash
git add src/screens/Recognition.jsx src/screens/Recognition.test.jsx
git commit -m "feat: reframe Recognition as celebratory onboarding finale"
```
