import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

const seed = { goalName: 'Finish my essay' }

test('shows the goal name and a back control', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Finish my essay')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})

test('renders the "Break it into milestones" section', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Break it into milestones')).toBeInTheDocument()
})

test('renders the Bandura & Schunk science note', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText(/Bandura & Schunk/)).toBeInTheDocument()
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('the milestone name is directly editable', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  const nameInput = screen.getByPlaceholderText(/name this milestone/i)
  await userEvent.type(nameInput, 'Research')
  expect(nameInput).toHaveValue('Research')
})

test('Next is disabled until at least one action exists', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('+ Add milestone adds a second milestone', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByRole('button', { name: /add milestone/i }))
  expect(screen.getAllByPlaceholderText(/name this milestone/i)).toHaveLength(2)
})

test('a newly added action defaults to repeating', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(screen.getByRole('button', { name: 'Repeats' })).toHaveAttribute('aria-pressed', 'true')
})
