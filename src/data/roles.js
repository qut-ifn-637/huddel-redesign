export const ROLES = [
  { value: 'all',      label: 'Everything', description: 'Sees your goal, your progress, and the hard days — and can check in. Best for a partner or close friend.', sees: 'sees everything — your progress and the hard days', shareLabel: 'shares everything' },
  { value: 'progress', label: 'Progress',   description: 'Sees your goal and your wins, never the hard days — and can cheer you on. Best for friends or family.',  sees: 'sees your goal and your wins', recommended: true, shareLabel: 'shares progress' },
  { value: 'goal',     label: 'Goal only',  description: "Sees only the goal you're working on — not your progress or the hard days. Best for someone you've told, to keep you honest.", sees: 'sees just your goal', shareLabel: 'goal only' },
]
