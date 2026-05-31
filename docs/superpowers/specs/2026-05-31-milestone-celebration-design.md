# Milestone Reached Celebration — Design Spec

**Date:** 2026-05-31
**Improvement:** #5 slice C from usability test findings — "subtle visual rewards on completion"
**File:** `docs/design-improvements.md` — "Visual design — too plain and formal"
**Affects:** `src/components/Celebration.jsx` (new), `src/screens/ReturnView.jsx`

---

## Problem

The participant wanted progress to feel tangible and celebratory, citing "confetti, animated checkmark" as the kind of moment that makes an app worth opening daily. The prototype already fills the action circle green and draws a checkmark on each action completion, but nothing marks the bigger, rarer moment of **reaching a milestone** — the proximal sub-goal that the whole structure builds toward.

## Decision

Add a brief, calm **celebration when a milestone is reached**: a soft confetti burst plus a fleeting "Milestone reached 🎉" line that fades in and out, then disappears. Action completion is unchanged (it keeps its existing checkmark) — celebration is reserved for the bigger moment so it stays meaningful rather than constant.

**Thesis alignment:** the project is deliberately calm and non-gamified (no streaks, points, or scores). This celebration is a *transient flourish* — it leaves no persistent counter or badge behind, only the quiet "✓ Reached" line that already exists. It honours the moment without turning progress into a game.

Decided via brainstorming + visual companion (live animation previews):
- **Trigger:** milestone reached only (rejected: every action completion — too frequent, risks feeling gamified; both-scaled — busier than the calm thesis wants).
- **Style:** soft confetti + an affirming word (rejected: gentle-glow-only and ripple-ring-only — chosen confetti for the tangible payoff the participant named; the word was explicitly added on the user's request).

---

## Design

### 1. `Celebration` component (new)

`src/components/Celebration.jsx` + `src/components/Celebration.module.css` — a self-contained presentational component.

**Props:** `onDone` (called once the celebration finishes).

**Renders:**
- A confetti burst of **12 particles**, computed once at module load with fixed angles/distances (deterministic — no `Math.random`):
  ```js
  const COLORS = ['var(--color-purple)', 'var(--color-coral)', 'var(--color-success-green)', 'var(--color-sunshine-yellow)', '#b9a8f5']
  const PARTICLES = Array.from({ length: 12 }, (_, i) => {
    const ang = (Math.PI * 2 * i) / 12 + i * 0.7
    const dist = 34 + (i % 4) * 12
    return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 18, rot: i * 47, color: COLORS[i % COLORS.length] }
  })
  ```
  Each particle is an absolutely-positioned `<span className={styles.particle}>` with inline CSS custom props `--dx`/`--dy`/`--rot` and `background`. The CSS animates `transform: translate(var(--dx), var(--dy)) scale(.4) rotate(var(--rot))` with opacity 1→0 over ~0.85s ease-out.
- A `<p className={styles.cheer}>` reading **"Milestone reached 🎉"** — Fraunces, `var(--color-progress-green)`, animated fade-in → hold → fade-out over ~1.9s (opacity 0→1→1→0 with a small vertical drift).

**Self-timing:**
```jsx
useEffect(() => {
  const t = setTimeout(() => { if (onDone) onDone() }, 1900)
  return () => clearTimeout(t)
}, [])
```
The `clearTimeout` cleanup prevents any state update after unmount.

**Accessibility:**
- The confetti `burst` wrapper is `aria-hidden="true"` (decorative).
- The cheer `<p>` carries `role="status"` so screen-reader users get a polite announcement.
- Under `@media (prefers-reduced-motion: reduce)`: particle animations are suppressed (no motion / particles hidden); the cheer word still appears (static fade), so the moment is honoured without movement.

**CSS** uses design tokens only (no hardcoded hex except the one decorative lavender particle colour `#b9a8f5`, which has no token; acceptable as a decorative confetti colour).

### 2. ReturnView integration (`src/screens/ReturnView.jsx`)

The celebration fires **only on the deliberate act of reaching**, not whenever a milestone happens to be `reached` (e.g. seeded or restored state).

- Add local state: `const [celebratingId, setCelebratingId] = useState(null)`.
- The **"Reached it ✓"** button handler becomes:
  ```jsx
  onClick={() => { setReached(milestone.id, true); setCelebratingId(milestone.id) }}
  ```
  Un-reaching (tapping the collapsed reached line) still calls `setReached(milestone.id, false)` only — no celebration.
- In the `status === 'reached'` branch, wrap the group so the celebration can overlay it, and render the component conditionally:
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
- Add `import Celebration from '../components/Celebration'`.
- `ReturnView.module.css`: add `.reachedGroup { position: relative; }` so the absolutely-positioned celebration anchors to the reached line.

When the timer fires, `onDone` clears `celebratingId`, the `Celebration` unmounts, and only the quiet `✓ Reached` line remains. No persisted state; nothing replays on navigation.

---

## Scope

**In scope:**
- Create `src/components/Celebration.jsx`, `Celebration.module.css`, `Celebration.test.jsx`.
- `src/screens/ReturnView.jsx` — `celebratingId` state, trigger on the "Reached it ✓" handler, render `<Celebration>` in the reached branch.
- `src/screens/ReturnView.module.css` — `.reachedGroup { position: relative; }`.
- `src/screens/ReturnView.test.jsx` — trigger tests.

**Out of scope:**
- No celebration on action completion (keeps its existing checkmark).
- No sound; no change to the Recognition onboarding finale.
- No scores/streaks/badges or any persisted reward.
- No celebration anywhere a milestone can't be "reached" (only ReturnView has the toggle).

---

## Testing

- **`Celebration.test.jsx`:**
  - renders the `Milestone reached 🎉` text;
  - renders 12 particle elements (`container.querySelectorAll('.particle')` — CSS-module names are non-scoped in tests);
  - calls `onDone` after its timer (`vi.useFakeTimers()`, render, `act(() => vi.advanceTimersByTime(1900))`, expect the `onDone` mock called once).
- **`ReturnView.test.jsx`:**
  - clicking "Reached it ✓" shows `Milestone reached 🎉`;
  - a milestone seeded as already `reached: true` shows **no** `Milestone reached 🎉` on initial render (regression guard: celebration only on the deliberate act).
- Full Vitest suite stays green.
