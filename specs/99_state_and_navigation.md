# State & Navigation

The prototype is stateful across screens. Carry one in-memory state object forward (React state / a simple store — **no localStorage or sessionStorage**, which fail in some sandboxes; keep it all in memory for the session).

## State shape

```js
{
  context: null,              // '01': 'work' | 'study' | 'both' | 'life_full'
  goalName: '',               // '02'
  actions: [                  // '02' — at least one pre-seeded worked example on load
    // { id, label, source: 'effort' | 'outcome' | 'custom', completed: false }
  ],
  cadence: 'few_times_week',  // '03': 'few_times_week' | 'most_days' | 'specific_days' | 'when_i_can'
  cadenceDays: [],            // '03' — only if cadence === 'specific_days', e.g. ['Mon','Wed','Fri']
  supporters: [],             // '04' — may be empty (skip is valid). { name, role }
}
```

`role` values (Screen 04): `'close_peer' | 'family' | 'study_friend' | 'work_availability'`.

## Routing map

| From | Action | To |
|------|--------|-----|
| 01 Welcome | Continue (after select) | 02 |
| 02 Goal + actions | Next (goal + ≥1 action) | 03 |
| 03 Cadence | Next | 04 |
| 04 Offered social | **Done — continue** | 05 |
| 04 Offered social | **Skip for now** | 05 |
| 05 Recognition | See what tomorrow looks like → | 06 |
| 06 Return view | (landing — happy path ends) | — |
| 06 Return view | supporter re-offer tapped (optional) | 04 |

## Hard rules enforced by navigation

1. **Screen 04 never blocks.** Both its buttons reach Screen 05. `supporters: []` is a complete, valid state.
2. **Cadence propagates.** Screens 05 and 06 must read `cadence` and adjust copy so a `when_i_can` user is never shown rhythm/streak language.
3. **No dead ends on the happy path.** Every screen 01→06 has a working forward action. (This is graded — a flow that won't advance mid-demo costs prototype marks.)
4. **Consistency of the complete control.** The tap-to-complete affordance and its instant Green-tick micro-feedback are identical on Screen 05 and Screen 06.

## Demo-readiness checklist (freeze build after this passes)

- [ ] 01→06 clickable end-to-end with no dead ends
- [ ] "Milestone" appears nowhere in the UI
- [ ] Effort tab is pre-selected and visually primary on Screen 02
- [ ] One worked-example action pre-seeded on Screen 02
- [ ] Cadence includes "Whenever I can" and downstream copy honours it
- [ ] Screen 04 skippable in one tap; skip reaches Screen 05
- [ ] Recognition is calm: green tick + one quiet peak, no streak/badge/confetti
- [ ] Return view shows the completed action within the first ~10s of the screen
- [ ] Huddel tokens applied; ≤3 accent colors per screen; no yellow text
- [ ] Mobile-shaped, primary actions thumb-reachable
- [ ] AI prompt/output screenshots saved for the references (ethics band)
