# Visual Refresh (Warm Lavender) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolour the prototype to a warm lavender + coral palette by remapping the global design tokens and tokenising every scattered hardcoded hex literal — keeping all layout, typography, spacing, and behaviour unchanged.

**Architecture:** All work is CSS-only. Task 1 establishes the token foundation in `src/styles/global.css` (remap values, add new tokens, recolour the `#root`/nav-gradient surfaces). Tasks 2–5 sweep the hardcoded hex literals out of the component and screen CSS modules, replacing each with the right token and applying coral to the designated secondary/optional actions. Because the look itself isn't unit-testable, each task is guarded by **file-content tests**: a token must be present (Task 1) or a CSS module must contain no hardcoded hex / must reference the coral token (Tasks 2–5). The full Vitest suite must stay green throughout (class names and markup are untouched).

**Tech Stack:** Vite 5, CSS Modules, Vitest (globals enabled — `test`/`expect` are global; no import needed). Guard tests read CSS files with `readFileSync(new URL('…', import.meta.url), 'utf8')` (Node ESM-safe).

**Reference:** spec at `docs/superpowers/specs/2026-05-31-visual-refresh-design.md`.

---

### Task 1: Token foundation in global.css

Remap the base tokens to warm values, add the new palette tokens, and point the app "paper" surfaces at cream.

**Files:**
- Create: `src/styles/global.test.js`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the failing tests**

Create `src/styles/global.test.js` with exactly this content:

```js
import { readFileSync } from 'fs'

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8')

test('global.css adds the warm-refresh palette tokens', () => {
  expect(css).toMatch(/--color-cream:\s*#fbf5ee/)
  expect(css).toMatch(/--color-coral:\s*#d2603a/)
  expect(css).toMatch(/--color-coral-tint:\s*#fadfce/)
  expect(css).toMatch(/--color-line:\s*#e7ddd0/)
  expect(css).toMatch(/--color-lavender-line:\s*#e3d9ee/)
  expect(css).toMatch(/--color-muted:\s*#9a8f92/)
  expect(css).toMatch(/--color-progress-green:\s*#2c9e63/)
  expect(css).toMatch(/--color-progress-tint:\s*#e7f7ee/)
})

test('global.css remaps the base tokens to warm values', () => {
  expect(css).toMatch(/--color-black:\s*#2b2230/)
  expect(css).toMatch(/--color-body-gray:\s*#6a5f60/)
  expect(css).toMatch(/--color-beige:\s*#f3ecf3/)
  expect(css).toMatch(/--color-purple-tint:\s*#efe6f5/)
  expect(css).toMatch(/--color-soft-blue:\s*#f3ece2/)
})

test('the app paper (#root) uses the cream token', () => {
  expect(css).toMatch(/#root\s*\{[^}]*background:\s*var\(--color-cream\)/)
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/styles/global.test.js
```

Expected: FAIL — the new tokens and the remapped values are not present yet.

- [ ] **Step 3: Replace the `:root` token block in global.css**

In `src/styles/global.css`, replace the entire `:root { … }` block (currently the color tokens through the spacing tokens) so the **color** section reads exactly:

```css
:root {
  --color-purple:          #5015ff;
  --color-purple-tint:     #efe6f5;
  --color-black:           #2b2230;
  --color-body-gray:       #6a5f60;
  --color-white:           #ffffff;
  --color-soft-blue:       #f3ece2;
  --color-sunshine-yellow: #fff493; /* decorative only — never for text */
  --color-orange:          #eb672f;
  --color-success-green:   #2feb7d;
  --color-beige:           #f3ecf3;

  /* warm refresh additions */
  --color-cream:           #fbf5ee;
  --color-coral:           #d2603a;
  --color-coral-tint:      #fadfce;
  --color-line:            #e7ddd0;
  --color-lavender-line:   #e3d9ee;
  --color-muted:           #9a8f92;
  --color-progress-green:  #2c9e63;
  --color-progress-tint:   #e7f7ee;

  --font-heading: 'Fraunces', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;

  --radius-card:   20px;
  --radius-button: 20px;

  --space-1:  2px;
  --space-2:  4px;
  --space-3:  8px;
  --space-4:  10px;
  --space-5:  15px;
  --space-6:  20px;
  --space-7:  25px;
  --space-8:  30px;
  --space-9:  50px;
  --nav-h: 64px;
}
```

- [ ] **Step 4: Point `#root` and the bottom-action gradient at cream**

In `src/styles/global.css`, in the `#root` rule, change the background line:

```css
/* Before */
  background: var(--color-white);
/* After */
  background: var(--color-cream);
```

And in the `.bottomActions` rule, change the gradient:

```css
/* Before */
  background: linear-gradient(transparent, var(--color-white) 30%);
/* After */
  background: linear-gradient(transparent, var(--color-cream) 30%);
```

(The global `body` background already uses `var(--color-soft-blue)`, which is now the warm `#f3ece2` — no edit needed there.)

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/styles/global.test.js
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: entire suite PASSES (no markup/class changes, so nothing breaks; +3 new tests).

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/styles/global.test.js
git commit -m "feat: warm-lavender token foundation in global.css"
```

---

### Task 2: Sweep core chrome components

Tokenise the most-seen interactive chrome and apply coral to SkipButton.

**Files:**
- Create: `src/test/palette-core-chrome.test.js`
- Modify: `src/components/CompleteControl.module.css`
- Modify: `src/components/MilestoneCard.module.css`
- Modify: `src/components/BottomNav.module.css`
- Modify: `src/components/SegmentedToggle.module.css`
- Modify: `src/components/SkipButton.module.css`

- [ ] **Step 1: Write the failing tests**

Create `src/test/palette-core-chrome.test.js` with exactly this content:

```js
import { readFileSync } from 'fs'

const files = {
  CompleteControl: new URL('../components/CompleteControl.module.css', import.meta.url),
  MilestoneCard:   new URL('../components/MilestoneCard.module.css', import.meta.url),
  BottomNav:       new URL('../components/BottomNav.module.css', import.meta.url),
  SegmentedToggle: new URL('../components/SegmentedToggle.module.css', import.meta.url),
  SkipButton:      new URL('../components/SkipButton.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}

test('SkipButton uses the coral accent', () => {
  expect(readFileSync(files.SkipButton, 'utf8')).toMatch(/color:\s*var\(--color-coral\)/)
})

test('BottomNav uses the cream surface', () => {
  expect(readFileSync(files.BottomNav, 'utf8')).toMatch(/background:\s*var\(--color-cream\)/)
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/test/palette-core-chrome.test.js
```

Expected: FAIL — the files still contain hex literals; SkipButton has no coral; BottomNav has no cream.

- [ ] **Step 3: Edit `CompleteControl.module.css`**

Two replacements:
- `.circle` border: `border: 2px solid #ccc;` → `border: 2px solid var(--color-lavender-line);`
- `.undo` border: `border: 1.5px solid #ddd;` → `border: 1.5px solid var(--color-line);`

- [ ] **Step 4: Edit `MilestoneCard.module.css`**

- Replace **all** occurrences of `#e6e0ff` with `var(--color-lavender-line)` (appears 4×: `.card`, `.chip`, `.segmented`, and `.segment + .segment`).
- `.body` border-top: `border-top: 1px solid #f0ecff;` → `border-top: 1px solid var(--color-lavender-line);`
- `.actionItem` border: `border: 1.5px solid #ddd;` → `border: 1.5px solid var(--color-line);`

- [ ] **Step 5: Edit `BottomNav.module.css`**

- `.bnNav` background: `background: var(--color-white);` → `background: var(--color-cream);`
- `.bnNav` border-top: `border-top: 1px solid #ececec;` → `border-top: 1px solid var(--color-line);`

- [ ] **Step 6: Edit `SegmentedToggle.module.css`**

- `.segToggle` border-bottom: `border-bottom: 1px solid #ececec;` → `border-bottom: 1px solid var(--color-line);`

- [ ] **Step 7: Edit `SkipButton.module.css`**

- `.btn` color: `color: var(--color-body-gray);` → `color: var(--color-coral);`

- [ ] **Step 8: Run the tests and confirm they pass**

```bash
npx vitest run src/test/palette-core-chrome.test.js
```

Expected: all tests PASS (5 no-hex + SkipButton coral + BottomNav cream).

- [ ] **Step 9: Commit**

```bash
git add src/components/CompleteControl.module.css src/components/MilestoneCard.module.css src/components/BottomNav.module.css src/components/SegmentedToggle.module.css src/components/SkipButton.module.css src/test/palette-core-chrome.test.js
git commit -m "feat: tokenise core chrome CSS to warm palette, coral on Skip"
```

---

### Task 3: Sweep social components

Tokenise SupportingCard and EncouragementSheet; green → progress tokens, struggle → coral.

**Files:**
- Create: `src/test/palette-social.test.js`
- Modify: `src/components/SupportingCard.module.css`
- Modify: `src/components/EncouragementSheet.module.css`

- [ ] **Step 1: Write the failing tests**

Create `src/test/palette-social.test.js` with exactly this content:

```js
import { readFileSync } from 'fs'

const SupportingCard   = new URL('../components/SupportingCard.module.css', import.meta.url)
const EncouragementSheet = new URL('../components/EncouragementSheet.module.css', import.meta.url)

test('SupportingCard.module.css has no hardcoded hex colours', () => {
  expect(readFileSync(SupportingCard, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
})

test('EncouragementSheet.module.css has no hardcoded hex colours', () => {
  expect(readFileSync(EncouragementSheet, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
})

test('SupportingCard maps struggle to coral and wins to the progress token', () => {
  const css = readFileSync(SupportingCard, 'utf8')
  expect(css).toMatch(/var\(--color-coral\)/)
  expect(css).toMatch(/var\(--color-progress-green\)/)
})
```

Note: `EncouragementSheet`'s backdrop uses `rgba(6, 0, 0, 0.35)` (not a hex) and its sheet stays `var(--color-white)` — both fine, the no-hex test only flags `#…` literals.

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/test/palette-social.test.js
```

Expected: FAIL — both files still contain hex literals.

- [ ] **Step 3: Edit `SupportingCard.module.css`**

- `.scQuiet` border: `border: 1px dashed #e0e0e0;` → `border: 1px dashed var(--color-line);`
- `.scPillGreen`: `background: #e7f7ee; color: #2c9e63;` → `background: var(--color-progress-tint); color: var(--color-progress-green);`
- `.scPillMuted` background: `background: #eee;` → `background: var(--color-line);`
- `.scProgress` color: `color: #2c9e63;` → `color: var(--color-progress-green);`
- `.scStruggle` color: `color: #a05a2c;` → `color: var(--color-coral);`
- `.scWin` color: `color: #2c9e63;` → `color: var(--color-progress-green);`
- `.scFootnote` color: `color: #999;` → `color: var(--color-muted);`
- `.scSecondaryAction` border: `border: 1px solid #ddd;` → `border: 1px solid var(--color-line);`

- [ ] **Step 4: Edit `EncouragementSheet.module.css`**

- `.esPreset` border: `border: 1px solid #ddd;` → `border: 1px solid var(--color-line);`
- `.esInput` border: `border: 1px solid #eee;` → `border: 1px solid var(--color-line);`

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/test/palette-social.test.js
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/SupportingCard.module.css src/components/EncouragementSheet.module.css src/test/palette-social.test.js
git commit -m "feat: tokenise social components, coral struggle + green progress tokens"
```

---

### Task 4: Sweep onboarding screens

Tokenise the onboarding screen CSS, including the dismissible example card on GoalActions.

**Files:**
- Create: `src/test/palette-onboarding.test.js`
- Modify: `src/screens/GoalActions.module.css`
- Modify: `src/screens/GoalSetup.module.css`
- Modify: `src/screens/OfferedSocial.module.css`

- [ ] **Step 1: Write the failing tests**

Create `src/test/palette-onboarding.test.js` with exactly this content:

```js
import { readFileSync } from 'fs'

const files = {
  GoalActions:  new URL('../screens/GoalActions.module.css', import.meta.url),
  GoalSetup:    new URL('../screens/GoalSetup.module.css', import.meta.url),
  OfferedSocial: new URL('../screens/OfferedSocial.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/test/palette-onboarding.test.js
```

Expected: FAIL — `GoalActions` (and the others) still contain hex literals.

- [ ] **Step 3: Edit `GoalActions.module.css`**

- `.addMilestone` border: `border: 1px dashed #c8bfff;` → `border: 1px dashed var(--color-lavender-line);`
- `.exampleMilestone` border: `border: 1.5px dashed #b8a8f0;` → `border: 1.5px dashed var(--color-lavender-line);`
- `.exampleMilestone` background: `background: #f8f7ff;` → `background: var(--color-purple-tint);`
- `.exampleLabel` color: `color: #8060dd;` → `color: var(--color-purple);`
- `.dismissBtn` color: `color: #bbb;` → `color: var(--color-muted);`
- `.exampleName` color: `color: #aaa;` → `color: var(--color-muted);`
- `.exampleDivider` border-top: `border-top: 1px solid #e8e4ff;` → `border-top: 1px solid var(--color-lavender-line);`
- `.exampleAction` color: `color: #bbb;` → `color: var(--color-muted);`
- `.exampleAction::before` color: `color: #c8bbff;` → `color: var(--color-lavender-line);`

- [ ] **Step 4: Edit `GoalSetup.module.css`**

- `.goalInput` border: `border: 1.5px solid #ddd;` → `border: 1.5px solid var(--color-line);`

- [ ] **Step 5: Edit `OfferedSocial.module.css`**

- `.nameInput` border: `border: 1.5px solid #ddd;` → `border: 1.5px solid var(--color-line);`

(Note: `.avatar { border: 2px solid white; }` uses the `white` keyword, not a hex — leave it.)

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run src/test/palette-onboarding.test.js
```

Expected: all 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/screens/GoalActions.module.css src/screens/GoalSetup.module.css src/screens/OfferedSocial.module.css src/test/palette-onboarding.test.js
git commit -m "feat: tokenise onboarding screen CSS to warm palette"
```

---

### Task 5: Sweep app-slice screens

Tokenise the post-onboarding screens and apply coral to ReturnView's secondary actions.

**Files:**
- Create: `src/test/palette-app-slice.test.js`
- Modify: `src/screens/MyHuddleView.module.css`
- Modify: `src/screens/EncouragementsScreen.module.css`
- Modify: `src/screens/ReturnView.module.css`

- [ ] **Step 1: Write the failing tests**

Create `src/test/palette-app-slice.test.js` with exactly this content:

```js
import { readFileSync } from 'fs'

const files = {
  MyHuddleView:        new URL('../screens/MyHuddleView.module.css', import.meta.url),
  EncouragementsScreen: new URL('../screens/EncouragementsScreen.module.css', import.meta.url),
  ReturnView:          new URL('../screens/ReturnView.module.css', import.meta.url),
}

for (const [name, url] of Object.entries(files)) {
  test(`${name}.module.css has no hardcoded hex colours`, () => {
    expect(readFileSync(url, 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
}

test('ReturnView applies coral to its secondary actions', () => {
  expect(readFileSync(files.ReturnView, 'utf8')).toMatch(/var\(--color-coral\)/)
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/test/palette-app-slice.test.js
```

Expected: FAIL — the files still contain hex literals; ReturnView has no coral.

- [ ] **Step 3: Edit `MyHuddleView.module.css`**

- Replace **both** occurrences of `border: 1px solid #ddd;` with `border: 1px solid var(--color-line);` (in `.mhInput` and `.mhChip`).

- [ ] **Step 4: Edit `EncouragementsScreen.module.css`**

- `.ecMeta` color: `color: #999;` → `color: var(--color-muted);`
- `.ecFootnote` color: `color: #aaa;` → `color: var(--color-muted);`

- [ ] **Step 5: Edit `ReturnView.module.css`**

- `.reOffer` color: `color: var(--color-body-gray);` → `color: var(--color-coral);`
- `.reOffer` border: `border: 1px dashed #ccc;` → `border: 1px dashed var(--color-line);`
- `.reOffer:hover`: change both `border-color: var(--color-purple);` → `border-color: var(--color-coral);` and `color: var(--color-purple);` → `color: var(--color-coral);`
- `.adaptBtn` color: `color: var(--color-body-gray);` → `color: var(--color-coral);`

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run src/test/palette-app-slice.test.js
```

Expected: all 4 tests PASS.

- [ ] **Step 7: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: entire suite PASSES (all guard tests green + every pre-existing test still green — no markup or class changes were made anywhere).

- [ ] **Step 8: Commit**

```bash
git add src/screens/MyHuddleView.module.css src/screens/EncouragementsScreen.module.css src/screens/ReturnView.module.css src/test/palette-app-slice.test.js
git commit -m "feat: tokenise app-slice screen CSS, coral on ReturnView secondary actions"
```

---

### Final verification (manual, after Task 5)

Pure CSS can't be visually unit-tested, so finish with a manual pass:

- [ ] Run `npm run dev` and view at 390px width.
- [ ] Walk every screen — onboarding (GoalSetup → GoalActions → Cadence → OfferedSocial → Recognition) and the app shell (Goals / Huddle / Supporting / Cheers, including opening the EncouragementSheet). Confirm the warm cream/lavender palette is coherent and there are no leftover cool-on-warm colours.
- [ ] Confirm coral appears only on: SkipButton, "+ Adapt my plan", the "re-offer" link, and the "struggling" supporter cue.
- [ ] Contrast spot-check: warm body text (`#6a5f60`) on cream/surface and coral links (`#d2603a`) are comfortably legible (WCAG AA).
