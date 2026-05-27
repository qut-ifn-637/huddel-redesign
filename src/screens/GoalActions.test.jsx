import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('renders the folded-in value-prop subhead', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('starts with one empty expanded step: effort chips visible, nothing pre-filled', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
  expect(screen.getAllByText('Write 400 words')).toHaveLength(1)
})

test('does not render an outcome / effort tab toggle', () => {
  renderWithApp(<GoalActions />)
  expect(screen.queryByText(/by outcome/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/by effort/i)).not.toBeInTheDocument()
})

test('the step name is directly editable', async () => {
  renderWithApp(<GoalActions />)
  const nameInput = screen.getByPlaceholderText(/name this step/i)
  await userEvent.type(nameInput, 'Research')
  expect(nameInput).toHaveValue('Research')
})

test('Next is disabled until a goal name and at least one action exist', async () => {
  renderWithApp(<GoalActions />)
  const next = () => screen.getByRole('button', { name: /^next$/i })
  expect(next()).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(next()).toBeDisabled()
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(next()).not.toBeDisabled()
})

test('tapping an effort chip adds it as an action in the step', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByText('Practice 20 min'))
  expect(screen.getAllByText('Practice 20 min')).toHaveLength(2)
})

test('+ Add step adds a second step (two name inputs)', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByRole('button', { name: /add step/i }))
  expect(screen.getAllByPlaceholderText(/name this step/i)).toHaveLength(2)
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
