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
  expect(screen.getByRole('button', { name: 'Recurring' })).toHaveAttribute('aria-pressed', 'true')
})

test('shows hierarchy helper text beneath the heading', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(
    screen.getByText(/each milestone is a big step toward your goal/i)
  ).toBeInTheDocument()
})

test('shows an example milestone on first render', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText(/example — tap/i)).toBeInTheDocument()
  expect(screen.getByText('Write the literature review')).toBeInTheDocument()
  expect(screen.getByText('Read 2 papers')).toBeInTheDocument()
  // 'Write 400 words' also appears as a chip suggestion — assert at least one instance exists
  expect(screen.getAllByText('Write 400 words').length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('Draft intro paragraph')).toBeInTheDocument()
})

test('dismissing the example removes it from the screen', async () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  await userEvent.click(screen.getByRole('button', { name: /dismiss example/i }))
  expect(screen.queryByText('Write the literature review')).not.toBeInTheDocument()
})

test('Next remains disabled while only the example is shown and no real actions exist', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled()
})

test('shows "Next" button by default (no returnTo set)', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByRole('button', { name: /^next$/i })).toBeInTheDocument()
})

test('shows "Save changes" button when returnTo is return-view', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: { ...seed, returnTo: 'return-view' } })
  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
})

test('shows the progress indicator on step 2', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
})

test('shows the connective greeting line', () => {
  renderWithApp(<GoalActions />, { initialStateOverrides: seed })
  expect(
    screen.getByText("Great start — now let's break it into doable steps.")
  ).toBeInTheDocument()
})
