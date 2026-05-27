import { render, screen, act, fireEvent } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'm1', name: 'Research', actions: [
      { id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false },
      { id: 'a2', label: 'Take notes', source: 'effort', completed: false },
    ]},
    { id: 'm2', name: 'Draft', actions: [
      { id: 'a3', label: 'Write 400 words', source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('shows all added actions', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
  expect(screen.getByText('Take notes')).toBeInTheDocument()
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('shows milestone headers when named and multiple', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('Draft')).toBeInTheDocument()
})

test('a single unnamed milestone renders flat (no header)', () => {
  const flat = {
    ...seedState,
    milestones: [{ id: 'm1', name: '', actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }] }],
  }
  renderWithApp(<Recognition />, { initialStateOverrides: flat })
  expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument()
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
})

test('"Skip for now" is always visible', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
})

test('before any completion there is no peak, science note, or continue button', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.queryByText(/That's one done/)).not.toBeInTheDocument()
  expect(screen.queryByText(/Bandura & Schunk/)).not.toBeInTheDocument()
  expect(screen.queryByText(/See what tomorrow looks like/)).not.toBeInTheDocument()
})

test('completing an action reveals the peak message and science note immediately', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: read 3 sources/i })) })
  expect(screen.getByText(/That's one done/)).toBeInTheDocument()
  expect(screen.getByText(/Bandura & Schunk/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('continue button appears 1.5s after completing (default cadence copy)', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'most_days' } })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: write 400 words/i })) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See what tomorrow looks like/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('continue shows home-base copy for when_i_can cadence', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'when_i_can' } })
  act(() => { fireEvent.click(screen.getByRole('button', { name: /mark complete: read 3 sources/i })) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See your home base/)).toBeInTheDocument()
  vi.useRealTimers()
})
