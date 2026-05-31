import { ROLES } from './roles'

test('exposes the three supporter roles in order', () => {
  expect(ROLES.map(r => r.value)).toEqual(['all', 'progress', 'goal'])
})

test('Progress is the recommended role', () => {
  const progress = ROLES.find(r => r.value === 'progress')
  expect(progress.recommended).toBe(true)
})

test('every role has a label, description, and a "sees" phrase', () => {
  for (const role of ROLES) {
    expect(role.label).toBeTruthy()
    expect(role.description).toBeTruthy()
    expect(role.sees).toBeTruthy()
  }
})

test('every role has a supporter-side shareLabel', () => {
  const expected = { all: 'shares everything', progress: 'shares progress', goal: 'goal only' }
  for (const role of ROLES) {
    expect(role.shareLabel).toBe(expected[role.value])
  }
})
