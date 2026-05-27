# Huddel App Slice — Design Spec

**Date:** 2026-05-27
**Project:** IFN637 Assignment 3 · Huddel redesign · Team 2
**Stack:** React + Vite, CSS Modules, AppContext (continues the onboarding prototype)
**Builds on:** `2026-05-27-huddel-onboarding-design.md` (onboarding flow already shipped)

---

## One-sentence spine

The onboarding ends at a home base; this slice opens that home into a small, navigable app — **Goals**, **Huddle** (the two-way social graph), and **Encouragements** — where the visibility role a supporter is given **defines how they are allowed to show up for the person they support**, keeping the whole social layer calm, optional, and free of pressure mechanics.

---

## Scope

**In scope (the tight slice):**

1. A persistent **bottom-tab navigation shell** with three tabs: **Goals · Huddle · Cheers** (Encouragements).
2. **Goals** tab — the existing home base (current `ReturnView`), single active goal.
3. **Huddle** tab — a toggle hosting two views:
   - **My huddle** — people supporting *you* (mirror; you control what each sees).
   - **Supporting** — people *you* support (the new concept; role-scoped views).
4. **Encouragements** tab — a calm inbox with **Received** and **Sent** views.
5. **Encouragement sheet** — a light compose surface launched from Supporting.

**Out of scope (deferred):** Vision board, Rewards (deliberately omitted — see thesis note), Notifications, Settings, real backend/auth, multi-goal management, contact import, real message delivery. Repeated-vs-one-off actions remain deferred per the onboarding spec.

---

## The Supporting concept (the heart of this slice)

Onboarding lets a user assign each supporter a **visibility role** — expressed as a relationship, not a permissions matrix (Spec 4):

| Role (`value`) | Label | What that person sees |
|---|---|---|
| `all` | Everything | Goals, progress, **and the hard days** — e.g. a partner or close friend |
| `progress` | Progress | Wins and momentum, **not** the struggles — e.g. an acquaintance |
| `availability` | Just availability | That you're busy, **not** what — e.g. a manager or coworker |

**Supporting flips this around.** When you support someone, *they* chose your role — so the role determines **what you can see of them and how you can encourage them.** The role is not just a privacy toggle on the sharer's side; it is the organising principle of the supporter's entire experience. This operationalises the A2 "controlled exposure, not no exposure" finding from *both* directions.

| Their role for you | You can see | Encouragement actions |
|---|---|---|
| `all` (Everything) | Goal name · live progress · a struggle signal | **Send encouragement** · **Check in** (gently acknowledges a hard day) |
| `progress` (Progress) | A win / momentum line only | **Cheer this win** |
| `availability` (Just availability) | A quiet "busy this week — give them space" line | **None — intentionally.** Respecting space *is* the support. |

The `availability`-only card is deliberately non-actionable. Showing nothing to do is a sharper thesis statement than a token button, and it teaches that restraint is a form of support.

---

## Information architecture & navigation

```
Onboarding (existing linear flow)
  GoalSetup → GoalActions → Cadence → OfferedSocial → Recognition
        │ (Recognition "See what tomorrow looks like →" now calls enterApp())
        ▼
App shell (NEW) ── persistent bottom tab bar ──┐
  ┌─────────────┬──────────────────┬───────────┘
  ▼             ▼                  ▼
 Goals        Huddle            Cheers
 (home)   ┌── toggle ──┐    ┌── toggle ──┐
          My huddle  Supporting   Received  Sent
                         │
                         ▼ (tap an action)
                  Encouragement sheet (overlay)
```

- The shell is entered by completing onboarding (Recognition's forward action) **or** directly for demo convenience (seeded state makes every tab populated without replaying onboarding).
- Tabs swap **instantly** (no fade). The 150ms fade is reserved for the onboarding flow, so the app feels like an app, not a wizard.
- Tab switches do **not** push onboarding history. The onboarding `goBack()` stack is untouched.

---

## State additions (`AppContext`)

Extend `defaultState`. Existing fields (`goalName`, `milestones`, `cadence`, `cadenceDays`, `supporters`) are unchanged.

```js
{
  // ...existing onboarding state...

  // App-shell navigation
  inApp: false,          // false during onboarding; true once shell is entered
  activeTab: 'goals',    // 'goals' | 'huddle' | 'encouragements'

  // My Huddle (people supporting YOU) — seeded for a coherent demo
  supporters: [
    { id: 'sup-1', name: 'Priya', role: 'all' },
    { id: 'sup-2', name: 'Mum',   role: 'progress' },
  ],

  // Supporting (people YOU support) — seeded demo data, role-scoped
  supporting: [
    { id: 'sg-1', name: 'Alex',   role: 'all',
      goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true },
    { id: 'sg-2', name: 'Sam',    role: 'progress',
      win: 'Just finished chapter 2' },
    { id: 'sg-3', name: 'Jordan', role: 'availability',
      status: 'Busy this week' },
  ],

  // Encouragements
  encouragements: {
    received: [
      { id: 'enc-1', from: 'Priya', message: 'So proud of you for sticking with it 💜', when: '2h ago' },
      { id: 'enc-2', from: 'Mum',   message: 'Saw you did your writing today!',          when: 'yesterday' },
    ],
    sent: [],  // appended to when the user sends a cheer
  },
}
```

New context actions:

- `enterApp()` — sets `inApp: true`, `activeTab: 'goals'`. Called by Recognition's forward button.
- `setTab(tab)` — sets `activeTab` (no fade, no history push).
- `sendEncouragement({ toId, toName, message })` — appends `{ id, to: toName, message, when: 'just now' }` to `encouragements.sent`.

**Onboarding-coherence note (resolve in plan):** `supporters` now ships with seeded defaults so My Huddle and Encouragements are populated in the demo. `OfferedSocial` (onboarding) must continue to present an empty add-list so the "add someone" narrative is intact — initialise its local working list to `[]` rather than from the seeds, and merge on continue. The shell reads `state.supporters` directly.

---

## Routing / shell mechanics

`App.jsx` gains a mode split:

```jsx
function App() {
  return <AppProvider><Root /></AppProvider>
}

function Root() {
  const { inApp } = useApp()
  return inApp ? <AppShell /> : <OnboardingRouter />
}
```

- `OnboardingRouter` = the current `Router` (fade + `SCREENS` map), unchanged.
- `AppShell` renders the active tab component above a persistent `<BottomNav />`.

```jsx
const TABS = {
  goals:          Goals,            // = current ReturnView content
  huddle:         HuddleScreen,     // hosts MyHuddleView / SupportingView
  encouragements: EncouragementsScreen,
}
```

`BottomNav`: three items (Goals · Huddle · Cheers), active item in Huddel Purple with a top-border indicator, inactive in Body Gray. Fixed to the bottom, thumb-reachable, ≤3 accent colors.

---

## Screen designs

### Goals tab (home base)

Reuse the existing `ReturnView` content essentially as-is, now rendered as the Goals tab.

- Greeting (Fraunces ~24px): **Welcome back.** + `goalName` prominent.
- Calm progress line: `N actions done · keep it rolling` (or `N actions done so far` when `cadence === 'when_i_can'`).
- Science note (global `.scienceNote`): *Seeing near-term progress sustains motivation. — Bandura & Schunk, 1981*
- Milestone groups with `CompleteControl` cards (unchanged behaviour and animation).
- Supporter line if `supporters` non-empty: **{firstName} can cheer this on.** Else the soft re-offer.
- Bottom `PrimaryButton`: **Mark today's action done** / all-done calm state.
- Single active goal only (tight). No multi-goal list.

### Huddle tab — shell

- Fraunces heading reflecting the active toggle.
- A two-segment toggle at the top: **My huddle** | **Supporting** (single-select, purple underline on active). Local component state, defaults to `My huddle`.

#### My huddle view (people supporting you)

- Subhead (Body Gray): **You choose what each one sees.**
- Count line (Fraunces ~17px): **{n} in your corner**
- One card per `supporters[]` entry (Beige, 20px radius, flat):
  - Name + a role pill using the role **label** ("sees everything" / "sees progress" / "availability only") with a `▾` affording change.
  - One-line plain-language description of what that person sees (reuse onboarding role descriptions).
- Footer affordance (purple text, not a heavy button): **+ Add someone** → routes to onboarding `OfferedSocial` (demonstrates "add people any time later"); never modal/blocking.
- Empty state: gentle **No one yet — and that's completely fine.** + the add affordance.

**Copy (verbatim):**
- Subhead: **You choose what each one sees.**
- Role descriptions: `all` → **Goals, progress, and the hard days.** · `progress` → **Your wins — not the struggles.** · `availability` → **That you're busy, not what you're working on.**
- Add: **+ Add someone**

#### Supporting view (people you support) — the centerpiece

- Subhead (Body Gray): **You see what each person chose to share. Nothing more.**
- Count line: **{n} people in your corner** *(here "your corner" = people who put you in theirs)*
- One card per `supporting[]` entry, rendered by role:

  **`all` (Everything) — fullest card, Beige:**
  - Name + pill **shares everything**
  - `goal` line · progress line in Success-Green-adjacent text (e.g. `● {progress}`) · struggle line in a warm muted tone (`○ Flagged a rough week`) when `struggleFlag`.
  - Actions: `PrimaryButton`-style pill **Send encouragement** + secondary **Check in**. Both open the Encouragement sheet (Check in pre-selects a gentle preset).

  **`progress` (Progress) — medium card, Beige:**
  - Name + pill **shares progress**
  - `● {win}` line only.
  - Action: **Cheer this win** → Encouragement sheet (win context).
  - Footnote (10px, gray): **You see wins, not the hard days.**

  **`availability` (Just availability) — minimal card, Soft Blue, dashed border:**
  - Name (muted) + pill **availability only**
  - **Busy this week — give them space.**
  - Footnote: **No goal shared. Nothing to do here, and that's the point.**
  - **No action button.**

**Copy (verbatim):**
- Subhead: **You see what each person chose to share. Nothing more.**
- Pills: **shares everything** · **shares progress** · **availability only**
- Actions: **Send encouragement** · **Check in** · **Cheer this win**
- Availability line: **Busy this week — give them space.**
- Availability footnote: **No goal shared. Nothing to do here, and that's the point.**

**Science / research note (`.scienceNote`):** lean on the A2 finding — *Controlled exposure (you see only what each person chose) supports the ambivalent sharer — A2 findings, Theme 2.* (No fabricated external citation; this is your own research.)

### Encouragements tab (Cheers)

- Fraunces ~17px: **Encouragements**
- Two-segment toggle: **Received** | **Sent** (defaults to Received).
- **Received:** one Beige card per `encouragements.received[]`:
  - The message in quotes (Body/Black) · `{from} · {when}` (gray, 10px).
  - Closing footnote once, below the list: **No counts. No streaks. Just the words.**
- **Sent:** one Beige card per `encouragements.sent[]`:
  - The message · `To {to} · {when}`.
  - Empty state: **Nothing sent yet. Cheer someone from Supporting.**

**Copy (verbatim):**
- Title: **Encouragements**
- Footnote: **No counts. No streaks. Just the words.**
- Sent empty: **Nothing sent yet. Cheer someone from Supporting.**

### Encouragement sheet (overlay)

Launched from a Supporting action. A bottom sheet (rounded top, purple top-accent, flat).

- Context line: **Cheer {name} — {win or goal context}** (for Check in: **Check in with {name}**).
- Preset chips (single-tap to choose, one active): **Proud of you 💜** · **Keep going!** · **You've got this** (Check in adds **Thinking of you**).
- Optional free-text field: placeholder **Add your own words (optional)…**
- `PrimaryButton`: **Send to {name}** (enabled once a preset is chosen or text entered).
- On send: call `sendEncouragement(...)`, close sheet, show a brief calm confirmation line **Sent to {name}.** (no celebratory animation beyond a quiet fade). The sent item now appears under Cheers → Sent.

**Copy (verbatim):**
- Presets: **Proud of you 💜** · **Keep going!** · **You've got this** · **Thinking of you**
- Field placeholder: **Add your own words (optional)…**
- Button: **Send to {name}**
- Confirmation: **Sent to {name}.**

---

## Components

**New:**
- `BottomNav` — three-tab persistent bar; `setTab` on click; active styling.
- `AppShell` — renders active tab + `BottomNav`.
- `HuddleScreen` — hosts the My huddle / Supporting toggle.
- `MyHuddleView` — supporter list (reads `supporters`).
- `SupportingView` — role-scoped people list (reads `supporting`); opens the sheet.
- `SupportingCard` — renders one supported person by role (handles the three layouts).
- `EncouragementsScreen` — Received / Sent toggle (reads `encouragements`).
- `EncouragementSheet` — compose overlay; calls `sendEncouragement`.
- `SegmentedToggle` — shared two-segment control (used by Huddle and Encouragements).
- `RolePill` — small role label pill (shared between My huddle and Supporting).

**Reused unchanged:** `PrimaryButton`, `SkipButton`, `CompleteControl`, `OptionCard`, avatar styles, `BackButton` (onboarding only), the global `screenPad` / `bottomActions` / `scienceNote` utilities.

`Goals` tab = the current `ReturnView` component, re-homed (its standalone routing entry is replaced by the tab). `ReturnView`'s re-offer button continues to route to `OfferedSocial`.

---

## Seeded demo data

Seeded so the shell can be demoed directly (every tab populated) without replaying onboarding — see the state block above. The data is internally coherent: the two people in **My huddle** (Priya `all`, Mum `progress`) are the senders of the two **Received** encouragements; **Supporting** shows the three roles at their three fidelity levels (Alex/Sam/Jordan).

---

## Design-token & thesis guardrails (non-negotiable)

- "milestone" remains permitted as the proximal-sub-goal layer (per the milestone reframe); never reintroduce the old ban.
- **No streaks, counts, points, badges, leaderboards, or confetti** — on either side of the social graph. Encouragements explicitly says "No counts. No streaks."
- **Rewards is intentionally omitted**; if discussed on camera, the omission is the argument (gamified rewards contradict the calm thesis).
- Role is always expressed as a **relationship in plain language**, never a toggle/permission matrix.
- `availability`-only supported people have **no encouragement action**.
- ≤3 accent colors per screen. Sunshine Yellow never used for text. Primary buttons full-width, pill, 20px radius, bottom-third (within sheets, bottom of sheet).
- Flat: no drop shadows; hierarchy via color, spacing, radius.
- Cadence honoured on the Goals tab (`when_i_can` users never see rhythm/streak language).

---

## Demo-readiness checklist

- [ ] Onboarding completes and lands in the app shell on the Goals tab.
- [ ] Bottom tab bar persists across Goals / Huddle / Cheers; active tab clearly indicated; thumb-reachable.
- [ ] Goals tab shows the completed/active goal with working `CompleteControl`s (unchanged behaviour).
- [ ] Huddle toggle switches between My huddle and Supporting.
- [ ] Supporting renders three distinct role fidelities: full (Alex), wins-only (Sam), availability-only (Jordan).
- [ ] Availability-only card has no action.
- [ ] Sending a cheer appends to Cheers → Sent and shows a calm confirmation.
- [ ] Encouragements Received shows seeded messages; "No counts. No streaks." present.
- [ ] No streak/badge/point/confetti anywhere; ≤3 accent colors per screen; no yellow text.
- [ ] Shell can also be entered directly with seeded state for demo.

---

## Out of scope / deferred

- Vision board, Rewards, Notifications, Settings.
- Real message delivery, auth, contact import, push notifications.
- Multi-goal management on the Goals tab.
- Editing a supporter's role end-to-end (the `▾` affordance can be visual-only for the demo, or open the existing role chips — decide in the plan).
- Repeated-vs-one-off action modelling (still deferred from the onboarding spec).
