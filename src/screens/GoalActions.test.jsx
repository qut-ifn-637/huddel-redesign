import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('starts with one empty expanded step: effort chips visible, nothing pre-filled', () => {
  renderWithApp(<GoalActions />)
  // chip is visible because the single step is expanded on load
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
  // no pre-seeded action card — "Write 400 words" exists only as the chip (one occurrence)
  expect(screen.getAllByText('Write 400 words')).toHaveLength(1)
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />)
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('Next is disabled until a goal name and at least one action exist', async () => {
  renderWithApp(<GoalActions />)
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(next()).toBeDisabled() // still no actions
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('tapping an effort chip adds it as an action in the step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByText('Practice 20 min'))
  // now present as both the chip and the action item → 2 occurrences
  expect(screen.getAllByText('Practice 20 min')).toHaveLength(2)
})

test('+ Add step adds a second step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByRole('button', { name: /add step/i }))
  expect(screen.getByText('Step 2')).toBeInTheDocument()
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
