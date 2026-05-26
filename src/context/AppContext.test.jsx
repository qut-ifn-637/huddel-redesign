import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'

function wrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}

test('initial state has one pre-seeded action', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.actions).toHaveLength(1)
  expect(result.current.state.actions[0].label).toBe('Write 400 words')
  expect(result.current.state.actions[0].source).toBe('effort')
  expect(result.current.state.actions[0].completed).toBe(false)
})

test('initial state has correct defaults', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state.context).toBeNull()
  expect(state.goalName).toBe('')
  expect(state.cadence).toBe('few_times_week')
  expect(state.cadenceDays).toEqual([])
  expect(state.supporters).toEqual([])
})

test('currentScreen starts at welcome', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.currentScreen).toBe('welcome')
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
  expect(result.current.currentScreen).toBe('welcome') // still old screen during fade
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
