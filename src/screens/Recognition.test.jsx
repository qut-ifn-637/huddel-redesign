import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Recognition from './Recognition'

const seedState = {
  goalName: 'Finish my essay',
  actions: [{ id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: false }],
  cadence: 'few_times_week',
}

test('renders headline verbatim', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText("You're set up. Try it once.")).toBeInTheDocument()
})

test('renders the first action as a CompleteControl', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
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

test('does not contain the word milestone', () => {
  renderWithApp(<Recognition />, { initialStateOverrides: seedState })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
