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

## Evidence base — what supporter features drive goal completion

A review of the goal-setting, social-support, digital-behaviour-change, and motivation literatures grounds this feature set. Three things stand out: the features with the **strongest** evidence are the *calm* ones; **controlled exposure** is well-justified by motivation science (not just a privacy nicety); and the gamified mechanics this redesign omits are precisely the ones with the **weakest or most counterproductive** evidence.

### Features prioritised (strongest evidence first)

1. **Visible, shared progress monitoring.** Monitoring goal progress reliably improves attainment (d⁺ = 0.40 across 138 studies), and the effect is *larger* when progress is reported publicly and physically recorded. — Harkin et al. (2016), *Psychological Bulletin* 142(2). *→ The Goals-tab progress and letting supporters see real progress is the single highest-leverage feature.*
2. **Positive encouragement ("kudos").** Receiving kudos causally increased running frequency and volume on Strava across 11 monthly waves. — "Kudos make you run!" (2022), *Social Networks* 71. *→ The Encouragements layer is evidence-backed, not decorative — favour positive reactions over rankings.*
3. **Self-chosen, real-world supporters.** In a meta-analysis of digital peer support (SMD ≈ 0.35, durable at follow-up), *informal, naturally-occurring* peer support outperformed *formal/trained* support. — Shen et al. (2025). *→ Users invite their own people (My Huddle / Supporting) — never assigned strangers or coaches.*
4. **Autonomy-supportive framing.** Autonomy-supportive contexts raise intrinsic motivation and persistence; controlling ones undermine them — replicated across 184 datasets and confirmed in intervention meta-analyses. — Ryan & Deci (2000); Ng et al. (2012); Ntoumanis et al. (2021). *→ "Offered, never demanded": invitations not nags, optional supporters, no obligation language.*
5. **Indispensable-partner framing (Köhler effect).** People exert more effort when paired with a moderately-superior partner whose contribution is indispensable — replicated even with software partners. — Kerr & Hertel (2003); Feltz et al. (2014). *→ "Your effort matters to them" beats a leaderboard; supporters are allies, not judges.*
6. **Small-win recognition (goal-gradient).** Effort accelerates toward a goal, and endowed early progress speeds completion. — Kivetz, Urminsky & Zheng (2006); Bandura & Schunk (1981). *→ Encouragement and progress should celebrate proximal wins (already the Goals-tab and Recognition design).*
7. **Opt-in public commitment.** Publicly disclosed goals were committed to more strongly than private ones. — Hollenbeck, Williams & Klein (1989). *→ Sharing a goal with named supporters helps — but opt-in, matching controlled exposure.*

### Why "controlled exposure" is the right default

The redesign lets users choose exactly what each supporter sees. Motivation science shows *unbounded* visibility can suppress effort or harm well-being:

- **Going public with identity goals can reduce effort.** When others recognise an identity-goal claim, people may feel a "premature sense" of the identity and act on it less — and this hit the *most* committed people hardest. — Gollwitzer, Sheeran, Michalski & Seifert (2009), *Psychological Science* 20(5). *Caveat: specific to identity claims, not progress-sharing, and frequently overstated in popular media.* *→ Default to progress / availability-only; don't broadcast "I'm becoming X."*
- **Visible support can cost more than invisible support.** Practical support the recipient *noticed* was ineffective or increased distress, while unnoticed ("invisible") support aided adjustment. — Bolger, Zuckerman & Kessler (2000), *JPSP* 79(6). *→ The strongest single argument for the quiet `availability`-only mode and against a high-visibility "everyone's watching" dashboard.*
- **Evaluation can impair performance.** Raising the stakes of being watched disrupts skilled execution ("choking"); an audience helps simple tasks but harms novel/complex ones. — Baumeister (1984); Bond & Titus (1983). *→ Let users dial visibility down, especially for fragile new goals; avoid evaluative "did you hit your target?" language.*
- **Forced comparison demotivates.** Extreme upward social comparison breeds disengagement and reduced affect. — Festinger (1954) and subsequent work. *→ No ranking among supporters; keep any benchmarking attainable and optional.*
- **Match support to the need.** Support buffers best when its *type* — emotional, informational, instrumental, appraisal — matches what's needed. — Cohen & Wills (1985); House (1981). *→ Roles scoped per relationship let the right kind of support reach the right person.*

### What this redesign deliberately omits — and why the evidence agrees

- **Leaderboards / competitive comparison** demotivate lower performers — consistent with the comparison findings above. *Reinforces omitting Rewards.*
- **Stakes / commitment contracts** work, but their effect *fades once the contract ends* — social pressure buys short-term action, not lasting habit. — Giné, Karlan & Zinman (2010); Bryan, Karlan & Nelson (2010). *Kept out of the calm slice; a possible opt-in advanced layer later.*
- **Frequent reminders** decay in effect and cause notification fatigue. — Bidargaddi et al. (2018, micro-randomised trial). *Any reminders must be sparse, contextual, user-controlled.*
- **Over-claiming retention:** social features mainly lift *short-term* engagement; attrition is intrinsic to digital interventions. — Eysenbach (2005, "Law of Attrition"); Elaheebocus et al. (2018). *Design for graceful disengagement; don't promise stickiness.*

### Claims explicitly avoided (academic-integrity note)

- The widely-circulated **"65% / 95% accountability appointment" statistic attributed to ASTD** has no locatable study — treat it as a myth; do **not** cite it.
- **StickK marketing multipliers** ("+230% with a referee", "3× with stakes") are platform self-report; cite the underlying RCTs instead.
- **Matthews (2015)** "write goals + report to a friend" (76% vs 43%) is real but **unpublished / not peer-reviewed** — cite only with that caveat.

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

**Science / research note (`.scienceNote`):** *You choose what each person sees — broadcasting an identity-goal too widely can sap the drive to pursue it. — Gollwitzer et al., 2009.*

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

**Science / research note (`.scienceNote`):** *You see only what each person chose — visible support can burden more than it helps. — Bolger, Zuckerman & Kessler, 2000.* (Pairs with the A2 "controlled exposure" finding, Theme 2.)

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

**Science / research note (`.scienceNote`):** *Genuine encouragement measurably lifts follow-through. — "Kudos make you run!", 2022.*

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
- **No streaks, counts, points, badges, leaderboards, or confetti** — on either side of the social graph. Encouragements explicitly says "No counts. No streaks." *Evidence: leaderboards/competitive comparison demotivate lower performers (see Evidence base).*
- **Rewards is intentionally omitted**; if discussed on camera, the omission is the argument (gamified rewards contradict the calm thesis). *Evidence: stakes/comparison effects fade or backfire; the durable levers are progress monitoring, encouragement, and autonomy support.*
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

---

## References

Verified, peer-reviewed sources behind the Evidence base. (Format is informal; convert to your assignment's citation style for submission.)

1. Bandura, A., & Schunk, D. H. (1981). Cultivating competence, self-efficacy, and intrinsic interest through proximal self-motivation. *Journal of Personality and Social Psychology*, 41(3), 586–598.
2. Baumeister, R. F. (1984). Choking under pressure: Self-consciousness and paradoxical effects of incentives on skillful performance. *Journal of Personality and Social Psychology*, 46(3), 610–620.
3. Bidargaddi, N., et al. (2018). To prompt or not to prompt? A micro-randomized trial of time-varying push notifications. *JMIR mHealth and uHealth* (and related micro-randomised-trial reports).
4. Bolger, N., Zuckerman, A., & Kessler, R. C. (2000). Invisible support and adjustment to stress. *Journal of Personality and Social Psychology*, 79(6), 953–961.
5. Bond, C. F., & Titus, L. J. (1983). Social facilitation: A meta-analysis of 241 studies. *Psychological Bulletin*, 94(2), 265–292.
6. Bryan, G., Karlan, D., & Nelson, S. (2010). Commitment devices. *Annual Review of Economics*, 2, 671–698.
7. Cohen, S., & Wills, T. A. (1985). Stress, social support, and the buffering hypothesis. *Psychological Bulletin*, 98(2), 310–357.
8. Elaheebocus, S. M. R. A., et al. (2018). Peer-based social media features in behavior change interventions: Systematic review. *npj Digital Medicine* / *Journal of Medical Internet Research*.
9. Eysenbach, G. (2005). The law of attrition. *Journal of Medical Internet Research*, 7(1), e11.
10. Feltz, D. L., et al. (2014). "Cyber buddy is better than no buddy": A test of the Köhler motivation effect in exergames. (Köhler-effect exergame studies.)
11. Festinger, L. (1954). A theory of social comparison processes. *Human Relations*, 7(2), 117–140.
12. Giné, X., Karlan, D., & Zinman, J. (2010). Put your money where your butt is: A commitment contract for smoking cessation. *American Economic Journal: Applied Economics*, 2(4), 213–235.
13. Gollwitzer, P. M., Sheeran, P., Michalski, V., & Seifert, A. E. (2009). When intentions go public: Does social reality widen the intention–behavior gap? *Psychological Science*, 20(5), 612–618.
14. Harkin, B., Webb, T. L., Chang, B. P. I., Prestwich, A., Conner, M., Kellar, I., Benn, Y., & Sheeran, P. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis of the experimental evidence. *Psychological Bulletin*, 142(2), 198–229.
15. Hollenbeck, J. R., Williams, C. R., & Klein, H. J. (1989). An empirical examination of the antecedents of commitment to difficult goals. *Journal of Applied Psychology*, 74(1), 18–23.
16. House, J. S. (1981). *Work Stress and Social Support*. Addison-Wesley.
17. Kerr, N. L., & Hertel, G. (2003 / 2007). The Köhler group motivation gain. (*Personality and Social Psychology Bulletin*, 33(6).)
18. Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. *Journal of Marketing Research*, 43(1), 39–58.
19. Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation. *American Psychologist*, 57(9), 705–717.
20. Ng, J. Y. Y., Ntoumanis, N., Thøgersen-Ntoumani, C., Deci, E. L., Ryan, R. M., Duda, J. L., & Williams, G. C. (2012). Self-determination theory applied to health contexts: A meta-analysis. *Perspectives on Psychological Science*, 7(4), 325–340.
21. Ntoumanis, N., et al. (2021). A meta-analysis of self-determination theory-informed intervention studies in the health domain. *Health Psychology Review*, 15(2), 214–244.
22. Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist*, 55(1), 68–78.
23. Shen, et al. (2025). Digital peer support and physical-health outcomes: A systematic review and meta-analysis.
24. Zajonc, R. B. (1965). Social facilitation. *Science*, 149(3681), 269–274.

**Verify before final submission (author/figure uncertainty):**
- *"Kudos make you run!"* (2022), *Social Networks*, 71 — confirm exact authorship before citing.
- Leaderboard-demotivation percentages — several surfaced via secondary summaries; trace to the primary study (e.g. relevant *JMIR Serious Games* / *Education and Information Technologies* articles) before quoting figures.
- Matthews, G. (2015), Dominican University of California — real but **unpublished**; cite with that caveat.
- Tu et al. (2024), *Computers in Human Behavior Reports* — social-comparison gamification RCT; confirm details if cited.
