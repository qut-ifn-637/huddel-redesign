import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import ReturnView from './ReturnView'

const baseState = {
  goalName: 'Finish my essay',
  milestones: [
    { id: 'milestone-1', name: 'Research', actions: [
      { id: 'seed-1', label: 'Write 400 words', source: 'effort', kind: 'repeat', count: 1 },
      { id: 'act-2',  label: 'Read for 30 min',  source: 'effort', kind: 'repeat', count: 0 },
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

test('a repeating action shows a "done N×" tally and an undo control', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByText(/done 1×/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /undo one/i })).toBeInTheDocument()
})

test('tapping a not-yet-done repeating action increments the progress count', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  await userEvent.click(screen.getByRole('button', { name: /mark done: read for 30 min/i }))
  expect(screen.getByText(/2 actions done · keep it rolling/)).toBeInTheDocument()
})

test('a one-off action toggles done and back via the circle', async () => {
  const once = {
    ...baseState,
    milestones: [{ id: 'milestone-1', name: '', actions: [
      { id: 'o1', label: 'Submit draft', source: 'effort', kind: 'once', count: 0 },
    ]}],
  }
  renderWithApp(<ReturnView />, { initialStateOverrides: once })
  await userEvent.click(screen.getByRole('button', { name: /submit draft/i }))
  expect(screen.getByText(/1 action done · keep it rolling/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /submit draft/i }))
  expect(screen.getByText(/0 actions done · keep it rolling/)).toBeInTheDocument()
})

test('shows an "Adapt my plan" button', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: baseState })
  expect(screen.getByRole('button', { name: /adapt my plan/i })).toBeInTheDocument()
})

const datedSeed = {
  goalName: 'Pass IFN637',
  supporters: [],
  milestones: [
    { id: 'm1', name: 'On-track milestone', targetDate: '2099-12-31', reached: false,
      actions: [{ id: 'a1', label: 'Read 2 papers', source: 'effort', kind: 'repeat', count: 0 }] },
    { id: 'm2', name: 'Slipped milestone', targetDate: '2000-01-01', reached: false,
      actions: [{ id: 'a2', label: 'Run analysis', source: 'effort', kind: 'repeat', count: 0 }] },
  ],
}

test('renders an On track chip for a far-future milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText('● On track')).toBeInTheDocument()
})

test('renders a Slipped chip for a past milestone', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText('○ Slipped')).toBeInTheDocument()
})

test('"Reached it" collapses a milestone to the reached line', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  const reachButtons = screen.getAllByRole('button', { name: /reached it/i })
  await userEvent.click(reachButtons[0])
  expect(screen.getByText(/✓ Reached/)).toBeInTheDocument()
  expect(screen.queryByText('Read 2 papers')).not.toBeInTheDocument()
})

test('a slipped milestone shows the support prompt and two actions', () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  expect(screen.getByText(/plans bend/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /move the date/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /let your huddle know/i })).toBeInTheDocument()
})

test('"Let your huddle know" shows a confirmation', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  await userEvent.click(screen.getByRole('button', { name: /let your huddle know/i }))
  expect(screen.getByText(/huddle.*told/i)).toBeInTheDocument()
})

test('"Move the date" reveals preset chips', async () => {
  renderWithApp(<ReturnView />, { initialStateOverrides: datedSeed })
  await userEvent.click(screen.getByRole('button', { name: /move the date/i }))
  expect(screen.getByRole('button', { name: '1 month' })).toBeInTheDocument()
})
