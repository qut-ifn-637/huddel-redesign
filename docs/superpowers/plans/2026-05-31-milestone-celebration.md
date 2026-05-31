# Milestone Reached Celebration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play a brief, calm celebration — a soft confetti burst + a fading "Milestone reached 🎉" line — when the user reaches a milestone on the home screen, leaving no persistent state behind.

**Architecture:** A new self-contained `Celebration` component renders 12 deterministic confetti particles (CSS-animated via custom props) and a self-timed cheer line that calls `onDone` after ~1.9s. `ReturnView` tracks a `celebratingId` set only by the "Reached it ✓" click, and renders `<Celebration>` over the reached line until its timer clears it. No celebration on already-reached milestones or on un-reaching.

**Tech Stack:** React 18, Vite, CSS Modules, Vitest + Testing Library (globals enabled — `test`/`expect`/`vi` global). CSS-module class names resolve to literal local names in tests (`classNameStrategy: 'non-scoped'`), so `container.querySelectorAll('.particle')` works.

Reference spec: `docs/superpowers/specs/2026-05-31-milestone-celebration-design.md`.

---

### Task 1: The `Celebration` component

A presentational component: confetti particles + a self-timed cheer line.

**Files:**
- Create: `src/components/Celebration.jsx`
- Create: `src/components/Celebration.module.css`
- Create: `src/components/Celebration.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Celebration.test.jsx` with exactly this content:

```jsx
import { render, screen, act } from '@testing-library/react'
import Celebration from './Celebration'

test('renders the cheer text and 12 confetti particles', () => {
  const { container } = render(<Celebration onDone={() => {}} />)
  expect(screen.getByText('Milestone reached 🎉')).toBeInTheDocument()
  expect(container.querySelectorAll('.particle')).toHaveLength(12)
})

test('calls onDone after the celebration finishes', () => {
  vi.useFakeTimers()
  const onDone = vi.fn()
  render(<Celebration onDone={onDone} />)
  expect(onDone).not.toHaveBeenCalled()
  act(() => { vi.advanceTimersByTime(1900) })
  expect(onDone).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/Celebration.test.jsx
```

Expected: FAIL — `Failed to resolve import "./Celebration"`.

- [ ] **Step 3: Create the component**

Create `src/components/Celebration.jsx` with exactly this content:

```jsx
import { useEffect } from 'react'
import styles from './Celebration.module.css'

const COLORS = ['var(--color-purple)', 'var(--color-coral)', 'var(--color-success-green)', 'var(--color-sunshine-yellow)', '#b9a8f5']

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const ang = (Math.PI * 2 * i) / 12 + i * 0.7
  const dist = 34 + (i % 4) * 12
  return {
    dx: Math.cos(ang) * dist,
    dy: Math.sin(ang) * dist - 18,
    rot: i * 47,
    color: COLORS[i % COLORS.length],
  }
})

export default function Celebration({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => { if (onDone) onDone() }, 1900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={styles.celebration}>
      <div className={styles.burst} aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, background: p.color }}
          />
        ))}
      </div>
      <p className={styles.cheer} role="status">Milestone reached 🎉</p>
    </div>
  )
}
```

- [ ] **Step 4: Create the stylesheet**

Create `src/components/Celebration.module.css` with exactly this content:

```css
.celebration {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

.burst {
  position: absolute;
  left: 30px;
  top: 12px;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  left: 0;
  top: 0;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  animation: confettiFly 0.85s ease-out forwards;
}

@keyframes confettiFly {
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.4) rotate(var(--rot)); opacity: 0; }
}

.cheer {
  position: absolute;
  left: 0;
  top: 28px;
  white-space: nowrap;
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-progress-green);
  opacity: 0;
  animation: cheerFade 1.9s ease-out forwards;
}

@keyframes cheerFade {
  0%   { opacity: 0; transform: translateY(6px); }
  18%  { opacity: 1; transform: translateY(0); }
  72%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .particle { animation: none; opacity: 0; }
  .cheer { animation: cheerStatic 1.9s ease-out forwards; }
}

@keyframes cheerStatic {
  0%   { opacity: 0; }
  18%  { opacity: 1; }
  72%  { opacity: 1; }
  100% { opacity: 0; }
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx vitest run src/components/Celebration.test.jsx
```

Expected: both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Celebration.jsx src/components/Celebration.module.css src/components/Celebration.test.jsx
git commit -m "feat: add Celebration component (soft confetti + milestone-reached cheer)"
```

---

### Task 2: Wire the celebration into ReturnView

Fire the celebration only when the user taps "Reached it ✓".

**Files:**
- Modify: `src/screens/ReturnView.jsx`
- Modify: `src/screens/ReturnView.module.css`
- Modify: `src/screens/ReturnView.test.jsx`

- [ ] **Step 1: Write the failing tests**

Append to the end of `src/screens/ReturnView.test.jsx`. (`datedSeed` is already defined in this file from an earlier task — its `m1` is an on-track, non-reached milestone, so it has a "Reached it ✓" button.)

```jsx
test('clicking "Reached it" shows the milestone-reached celebration', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  const reachButtons = screen.getAllByRole('button', { name: /reached it/i })
  await userEvent.click(reachButtons[0])
  expect(screen.getByText('Milestone reached 🎉')).toBeInTheDocument()
})

test('a milestone already reached shows no celebration on initial render', () => {
  const reachedSeed = {
    goalName: 'Pass IFN637',
    supporters: [],
    milestones: [
      { id: 'm1', name: 'Done milestone', targetDate: '2099-12-31', reached: true,
        actions: [{ id: 'a1', label: 'Read 2 papers', source: 'effort', kind: 'repeat', count: 0 }] },
    ],
  }
  renderWithApp(<ReturnView />, { initialStateOverrides: reachedSeed })
  expect(screen.queryByText('Milestone reached 🎉')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: the first new test FAILS (no celebration yet). The second PASSES already (nothing renders the cheer) — it's a regression guard. Pre-existing tests still PASS.

- [ ] **Step 3: Add the import**

In `src/screens/ReturnView.jsx`, add the import directly after the `CompleteControl` import (line 3):

```jsx
import CompleteControl from '../components/CompleteControl'
import Celebration from '../components/Celebration'
```

- [ ] **Step 4: Add the `celebratingId` state**

In `src/screens/ReturnView.jsx`, add this state declaration immediately after the existing `const [notifiedIds, setNotifiedIds] = useState([])` line:

```jsx
  const [celebratingId, setCelebratingId] = useState(null)
```

- [ ] **Step 5: Render the celebration in the reached branch**

In `src/screens/ReturnView.jsx`, replace the entire `if (status === 'reached') { ... }` block with:

```jsx
          if (status === 'reached') {
            return (
              <div key={milestone.id} className={`${styles.stepGroup} ${styles.reachedGroup}`}>
                <button type="button" className={styles.reachedLine} onClick={() => setReached(milestone.id, false)}>
                  <span className={styles.reachedChip}>✓ Reached</span>
                  <span className={styles.reachedName}>{name}</span>
                </button>
                {celebratingId === milestone.id && <Celebration onDone={() => setCelebratingId(null)} />}
              </div>
            )
          }
```

- [ ] **Step 6: Fire the celebration from the "Reached it ✓" button**

In `src/screens/ReturnView.jsx`, replace the `reachLink` button:

```jsx
// Before
              <button type="button" className={styles.reachLink} onClick={() => setReached(milestone.id, true)}>
                Reached it ✓
              </button>
// After
              <button type="button" className={styles.reachLink} onClick={() => { setReached(milestone.id, true); setCelebratingId(milestone.id) }}>
                Reached it ✓
              </button>
```

- [ ] **Step 7: Add the relative anchor to ReturnView.module.css**

Append to the end of `src/screens/ReturnView.module.css`:

```css
.reachedGroup {
  position: relative;
}
```

- [ ] **Step 8: Run the tests and confirm they pass**

```bash
npx vitest run src/screens/ReturnView.test.jsx
```

Expected: all tests PASS (2 new + all pre-existing).

- [ ] **Step 9: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: entire suite PASSES.

- [ ] **Step 10: Commit**

```bash
git add src/screens/ReturnView.jsx src/screens/ReturnView.module.css src/screens/ReturnView.test.jsx
git commit -m "feat: play milestone-reached celebration on the home screen"
```

---

### Final verification (manual, after Task 2)

- [ ] Run `npm run dev` at 390px. On the home screen, tap "Reached it ✓" on a milestone and confirm the soft confetti burst + "Milestone reached 🎉" plays once and fades, leaving the quiet "✓ Reached" line. Navigate away and back — confirm it does not replay.
