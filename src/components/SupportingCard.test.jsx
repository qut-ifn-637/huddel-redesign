import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SupportingCard from './SupportingCard'

const everything = { id: 'sg-1', name: 'Alex', role: 'all', goal: 'Run a half-marathon', progress: '3 of 5 runs this week', struggleFlag: true }
const progress   = { id: 'sg-2', name: 'Sam',  role: 'progress', win: 'Just finished chapter 2' }
const availability = { id: 'sg-3', name: 'Jordan', role: 'availability', status: 'Busy this week' }

test('Everything role shows goal, progress, struggle and both actions', () => {
  render(<SupportingCard person={everything} onAct={() => {}} />)
  expect(screen.getByText('Run a half-marathon')).toBeInTheDocument()
  expect(screen.getByText(/3 of 5 runs this week/)).toBeInTheDocument()
  expect(screen.getByText(/rough week/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send encouragement/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
})

test('Progress role shows the win and only a cheer action', () => {
  render(<SupportingCard person={progress} onAct={() => {}} />)
  expect(screen.getByText(/Just finished chapter 2/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cheer this win/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
})

test('Availability role shows the space line and NO action button', () => {
  render(<SupportingCard person={availability} onAct={() => {}} />)
  expect(screen.getByText(/give them space/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('an action calls onAct with the person and chosen mode', async () => {
  const onAct = vi.fn()
  render(<SupportingCard person={progress} onAct={onAct} />)
  await userEvent.click(screen.getByRole('button', { name: /cheer this win/i }))
  expect(onAct).toHaveBeenCalledWith(progress, 'cheer')
})
