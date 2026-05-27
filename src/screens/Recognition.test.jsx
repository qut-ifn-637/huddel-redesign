import { render, screen, act, fireEvent } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('renders the first incomplete action as a CompleteControl', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('shows the milestone label when the owning milestone is named', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Research')).toBeInTheDocument()
})

test('omits the milestone label when the owning milestone is unnamed', () => {
  const unnamed = { ...seedState, milestones: [{ id: 'milestone-1', name: '', actions: seedState.milestones[0].actions }] }
  renderWithApp(<Recognition />, { initialStateOverrides: unnamed })
  expect(screen.queryByText('Research')).not.toBeInTheDocument()
})

test('picks the first INCOMPLETE action across milestones', () => {
  const multi = {
    ...seedState,
    milestones: [
      { id: 'm1', name: 'Research', actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: true }] },
      { id: 'm2', name: 'Draft', actions: [{ id: 'a2', label: 'Write 400 words', source: 'effort', completed: false }] },
    ],
  }
  renderWithApp(<Recognition />, { initialStateOverrides: multi })
  expect(screen.getByRole('button', { name: /mark complete: write 400 words/i })).toBeInTheDocument()
})

test('shows default continue copy for non-when_i_can cadence', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'most_days' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See what tomorrow looks like/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('shows when_i_can continue copy when cadence is when_i_can', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: { ...seedState, cadence: 'when_i_can' } })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  act(() => { vi.advanceTimersByTime(1600) })
  expect(screen.getByText(/See your home base/)).toBeInTheDocument()
  vi.useRealTimers()
})

test('shows the Bandura & Schunk science note after completing', () => {
  vi.useFakeTimers()
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  const control = screen.getByRole('button', { name: /mark complete/i })
  act(() => { fireEvent.click(control) })
  expect(screen.getByText(/builds the confidence/i)).toBeInTheDocument()
  vi.useRealTimers()
})
