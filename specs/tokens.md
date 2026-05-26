# Design Tokens — Huddel

Derived from the official Huddel design reference. Use these exactly. Do not invent values.

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| Huddel Purple | `#5015ff` | Primary buttons, links, brand accents, active states |
| Black | `#060000` | Primary text and headings |
| Body Gray | `#474747` | Secondary text, body content, helper text |
| White | `#ffffff` | Primary background, card surfaces |
| Soft Blue | `#f9fafb` | Secondary background areas |
| Sunshine Yellow | `#fff493` | Decorative elements, highlights — **NEVER for text** |
| Energetic Orange | `#eb672f` | CTA highlights, accent (use sparingly) |
| Success Green | `#2feb7d` | Completion ticks, success states, positive indicators |
| Secondary Beige | `#f4f3ec` | Subtle background variation, card differentiation |

**Rule: max 3 accent colors visible in any single screen.** Purple is the workhorse; Green is reserved for completion; Orange and Yellow are occasional.

## Typography

- **Headings:** Gelica, weights 500–700, sizes 24–60px, tight letter-spacing. Use for screen titles and goal names.
- **Body & UI:** Inter, 16px / 22.4px line-height, weights 400–600. Use for everything else.
- If Gelica is unavailable in the build environment, fall back to a warm serif (e.g. "Fraunces", "Georgia") — never a generic sans for headings, as it loses Huddel's character.

## Spacing

- 2px base grid. Scale: 1, 4, 5, 6, 7.5, 10, 15, 20, 25, 30, 50.
- Generous whitespace between sections: 30–50px.
- Comfortable card padding: 20–25px.

## Components

- **Primary button:** full-width, pill-shaped, 20px radius, Huddel Purple fill, white Inter 16px/600 label. Sits in the bottom third of the screen.
- **Secondary / skip button:** text-only or outline, Body Gray label, no fill. Always visibly available where offered, never disguised.
- **Card:** White or Beige surface, 20px radius, no drop shadow. Differentiate by background color and spacing, not elevation.
- **Tag / badge:** small rounded element, soft background fill, used for categorisation (e.g. an effort-template chip).
- **Completion tick:** Success Green, animates in under 0.2s on tap.
- **Avatar group:** overlapping circular images, used only on the social screen and return view to evoke the "huddle."

## Elevation

Flat. No drop shadows. Hierarchy comes from color contrast, spacing, and rounded corners only.

## Tone of copy

Warm, plain, encouraging, never clinical or gamified. Short sentences. Talk like a supportive friend, not a productivity coach. Avoid hustle language ("crush your goals," "stay on streak").
