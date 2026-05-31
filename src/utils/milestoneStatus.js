const DAY_MS = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function milestoneStatus(milestone, today = new Date()) {
  if (milestone.reached) return 'reached'
  if (!milestone.targetDate) return 'none'
  const target = startOfDay(new Date(milestone.targetDate + 'T00:00:00'))
  const days = Math.round((target - startOfDay(today)) / DAY_MS)
  if (days < 0) return 'slipped'
  if (days <= 3) return 'duesoon'
  return 'ontrack'
}

export function formatSoftDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `~${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function presetDate(key, today = new Date()) {
  const d = startOfDay(today)
  if (key === 'week') d.setDate(d.getDate() + 7)
  else if (key === 'fortnight') d.setDate(d.getDate() + 14)
  else if (key === 'month') d.setMonth(d.getMonth() + 1)
  return toISO(d)
}
