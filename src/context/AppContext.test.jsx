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

test('default state seeds supporting and encouragements demo data', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const { state } = result.current
  expect(state.supporting.map(p => p.role)).toEqual(['all', 'progress', 'availability'])
  expect(state.encouragements.received).toHaveLength(2)
  expect(state.encouragements.sent).toEqual([])
})

test('inApp starts false and activeTab starts at goals', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.inApp).toBe(false)
  expect(result.current.activeTab).toBe('goals')
})

test('enterApp enters the shell on the goals tab and seeds supporters when empty', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.enterApp() })
  expect(result.current.inApp).toBe(true)
  expect(result.current.activeTab).toBe('goals')
  expect(result.current.state.supporters.map(s => s.name)).toEqual(['Priya', 'Mum'])
})

test('enterApp keeps supporters the user already added', () => {
  function customWrapper({ children }) {
    return <AppProvider initialStateOverrides={{ supporters: [{ id: 'u1', name: 'Jo', role: 'all' }] }}>{children}</AppProvider>
  }
  const { result } = renderHook(() => useApp(), { wrapper: customWrapper })
  act(() => { result.current.enterApp() })
  expect(result.current.state.supporters).toEqual([{ id: 'u1', name: 'Jo', role: 'all' }])
})

test('setTab switches the active tab', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.setTab('huddle') })
  expect(result.current.activeTab).toBe('huddle')
})

test('sendEncouragement appends to the sent list', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => { result.current.sendEncouragement({ toName: 'Sam', message: 'Keep going!' }) })
  expect(result.current.state.encouragements.sent).toHaveLength(1)
  expect(result.current.state.encouragements.sent[0]).toMatchObject({ to: 'Sam', message: 'Keep going!', when: 'just now' })
})

test('default milestone has null targetDate and reached=false', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const m = result.current.state.milestones[0]
  expect(m.targetDate).toBeNull()
  expect(m.reached).toBe(false)
})

test('demo supporter Alex has a slipped line and no struggleFlag', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const alex = result.current.state.supporting.find(p => p.name === 'Alex')
  expect(alex.slipped).toMatch(/slipped past/i)
  expect(alex.struggleFlag).toBeUndefined()
})
