import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalActions from './GoalActions'

test('renders headline verbatim', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('pre-seeds one "Write 400 words" action on load', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getAllByText('Write 400 words').length).toBeGreaterThanOrEqual(1)
})

test('"By effort" tab is selected by default', () => {
  renderWithApp(<GoalActions />)
  const effortTab = screen.getByRole('button', { name: /by effort/i })
  expect(effortTab).toHaveAttribute('aria-selected', 'true')
})

test('Next button disabled when goalName is empty', () => {
  renderWithApp(<GoalActions />)
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled()
})

test('Next button enabled when goalName is filled and actions exist', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.type(screen.getByPlaceholderText(/finish my essay/i), 'My goal')
  expect(screen.getByRole('button', { name: /^next$/i })).not.toBeDisabled()
})

test('tapping a chip adds it to the action list', async () => {
  renderWithApp(<GoalActions />)
  await userEvent.click(screen.getByText('Read for 30 min'))
  expect(screen.getAllByText('Read for 30 min').length).toBeGreaterThan(0)
})

test('does not contain the word milestone', () => {
  renderWithApp(<GoalActions />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
