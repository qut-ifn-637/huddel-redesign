import { milestoneStatus, formatSoftDate, presetDate } from './milestoneStatus'

const today = new Date('2026-06-01T12:00:00')

test('reached milestone is "reached" regardless of date', () => {
  expect(milestoneStatus({ reached: true, targetDate: '2026-05-01' }, today)).toBe('reached')
})

test('milestone with no date is "none"', () => {
  expect(milestoneStatus({ reached: false, targetDate: null }, today)).toBe('none')
})

test('date in the past is "slipped"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-05-30' }, today)).toBe('slipped')
})

test('date today or within 3 days is "duesoon"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-01' }, today)).toBe('duesoon')
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-03' }, today)).toBe('duesoon')
})

test('date more than 3 days out is "ontrack"', () => {
  expect(milestoneStatus({ reached: false, targetDate: '2026-06-20' }, today)).toBe('ontrack')
})

test('formatSoftDate renders a soft "~DD Mon"', () => {
  expect(formatSoftDate('2026-06-14')).toBe('~14 Jun')
  expect(formatSoftDate(null)).toBe('')
})

test('presetDate computes ISO dates relative to today', () => {
  expect(presetDate('week', today)).toBe('2026-06-08')
  expect(presetDate('fortnight', today)).toBe('2026-06-15')
  expect(presetDate('month', today)).toBe('2026-07-01')
})
