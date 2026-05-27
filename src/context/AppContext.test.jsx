import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp, allActions } from './AppContext'

function wrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}

test('initial state has one empty step', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.steps).toHaveLength(1)
  expect(result.current.state.steps[0].name).toBe('')
  expect(result.current.state.steps[0].actions).toEqual([])
})

test('initial state has correct defaults (no context field)', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state).not.toHaveProperty('context')
  expect(state.goalName).toBe('')
  expect(state.cadence).toBe('few_times_week')
  expect(state.cadenceDays).toEqual([])
  expect(state.supporters).toEqual([])
})

test('currentScreen starts at goal-actions', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('goal-actions')
})

test('updateState merges partial updates without clobbering other fields', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.updateState({ goalName: 'My goal' }) })
  expect(result.current.state.goalName).toBe('My goal')
  expect(result.current.state.cadence).toBe('few_times_week')
})

test('goTo changes currentScreen after 150ms', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goTo('cadence') })
  expect(result.current.currentScreen).toBe('goal-actions') // old screen during fade
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('cadence')
  vi.useRealTimers()
})

test('initialStateOverrides are applied when provided', () => {
  function customWrapper({ children }) {
    return (
      <AppProvider initialStateOverrides={{ goalName: 'Pre-filled goal' }}>
        {children}
      </AppProvider>
    )
  }
  const { result } = renderHook(() => useApp(), { wrapper: customWrapper })
  expect(result.current.state.goalName).toBe('Pre-filled goal')
})

test('allActions flattens actions across all steps', () => {
  const steps = [
    { id: 's1', name: 'A', actions: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 's2', name: 'B', actions: [{ id: 'a3' }] },
  ]
  expect(allActions(steps).map(a => a.id)).toEqual(['a1', 'a2', 'a3'])
})
