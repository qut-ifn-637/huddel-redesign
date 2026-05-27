import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
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

test('groups actions under a named milestone header with a per-milestone count', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText('Research')).toBeInTheDocument()
  expect(screen.getByText('1/2')).toBeInTheDocument()
})

test('a single unnamed milestone renders flat (no header or count)', () => {
  const flat = { ...baseState, milestones: [{ id: 'milestone-1', name: '', actions: baseState.milestones[0].actions }] }
  renderWithApp(<ReturnView />, { initialStateOverrides: flat })
  expect(screen.queryByText('1/2')).not.toBeInTheDocument()
  expect(screen.queryByText('Milestone 1')).not.toBeInTheDocument()
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('completed action is shown ticked', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  const circles = document.querySelectorAll('[data-testid="complete-circle"]')
  const completedCircles = Array.from(circles).filter(el => el.className.includes('completed'))
  expect(completedCircles.length).toBeGreaterThanOrEqual(1)
})

test('shows the "Your corner" block with what each supporter sees', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'progress' }] } })
  expect(screen.getByText('Your corner')).toBeInTheDocument()
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText(/sees your progress/i)).toBeInTheDocument()
})

test('the share button confirms after tapping', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [{ name: 'Alex', role: 'progress' }] } })
  await userEvent.click(screen.getByRole('button', { name: /share this week's progress/i }))
  expect(screen.getByText(/Shared — your corner can cheer you on/i)).toBeInTheDocument()
})

test('shows soft re-offer when no supporters', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: { ...baseState, supporters: [] } })
  expect(screen.getByText(/add someone to cheer you on/i)).toBeInTheDocument()
})

test('renders the Bandura & Schunk progress science note', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/near-term progress sustains/i)).toBeInTheDocument()
})
