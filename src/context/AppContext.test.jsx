import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp, allActions } from './AppContext'

function wrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}

test('initial state has one empty milestone', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.milestones).toHaveLength(1)
  expect(result.current.state.milestones[0].name).toBe('')
  expect(result.current.state.milestones[0].actions).toEqual([])
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

test('currentScreen starts at goal', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('goal')
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
  expect(result.current.currentScreen).toBe('goal') // old screen during fade
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

test('allActions flattens actions across all milestones', () => {
  const milestones = [
    { id: 'm1', name: 'A', actions: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 'm2', name: 'B', actions: [{ id: 'a3' }] },
  ]
  expect(allActions(milestones).map(a => a.id)).toEqual(['a1', 'a2', 'a3'])
})

test('goBack returns to the previous screen after navigating forward', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goTo('cadence') })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('cadence')
  act(() => { result.current.goBack() })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('goal')
  vi.useRealTimers()
})

test('canGoBack is false initially and true after navigating forward', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.canGoBack).toBe(false)
  act(() => { result.current.goTo('cadence') })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.canGoBack).toBe(true)
  vi.useRealTimers()
})

test('goBack is a no-op when there is no history', () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.goBack() })
  act(() => { vi.advanceTimersByTime(150) })
  expect(result.current.currentScreen).toBe('goal')
  vi.useRealTimers()
})
