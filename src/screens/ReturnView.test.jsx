import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  steps: [
    { id: 'step-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', completed: true },
      { id: 'act-2',  label: 'Read for 30 min',  source: 'effort', completed: false },
    ]},
  ],
  cadence: 'few_times_week',
  supporters: [],
}

test('renders goal name prominently', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Finish my essay')).toBeInTheDocument()
})

test('shows "Welcome back." greeting', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Welcome back.')).toBeInTheDocument()
})

test('shows rhythm progress copy for non-when_i_can cadence', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/1 action done · keep it rolling/)).toBeInTheDocument()
})

test('shows cumulative progress copy for when_i_can cadence', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, cadence: 'when_i_can' } })
  expect(screen.getByText(/1 action done so far/)).toBeInTheDocument()
})

test('groups actions under a named step header with a per-step count', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
})

test('a single unnamed step renders flat (no step header or count)', () => {
  const flat = { ...baseState, steps: [{ id: 'step-1', name: '', actions: baseState.steps[0].actions }] }
  renderWithApp(<ReturnView />, { initialStateOverrides: flat })
  expect(screen.queryByText('1/2')).not.toBeInTheDocument()
  expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
  // actions still render
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('completed action is shown ticked (CompleteControl with completed=true)', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  const circles = document.querySelectorAll('[data-testid="complete-circle"]')
  const completedCircles = Array.from(circles).filter(el => el.className.includes('completed'))
  expect(completedCircles.length).toBeGreaterThanOrEqual(1)
})

test('does not show supporter section when supporters is empty', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.queryByText(/can cheer this on/i)).not.toBeInTheDocument()
})

test('shows supporter line (by name) when supporters is non-empty', () => {
  renderWithApp(<ReturnView />, {
    initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'single_goal' }] },
  })
  expect(screen.getByText(/Alex can cheer this on/i)).toBeInTheDocument()
})

test('shows soft re-offer when no supporters', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.getByText(/add someone to cheer you on/i)).toBeInTheDocument()
})

test('does not contain the word milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
