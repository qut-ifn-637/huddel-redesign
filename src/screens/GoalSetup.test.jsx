import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import GoalSetup from './GoalSetup'

test('renders brand, headline, and value-prop subhead', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByText('Huddel')).toBeInTheDocument()
  expect(screen.getByText('What goal are you working on?')).toBeInTheDocument()
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('renders the goal input with a specificity helper', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByPlaceholderText(/pass ifn637/i)).toBeInTheDocument()
  expect(screen.getByText(/Be specific and make it yours/)).toBeInTheDocument()
})

test('renders the Locke & Latham science note', () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByText(/Locke & Latham/)).toBeInTheDocument()
})

test('Continue is disabled until a goal name is entered', async () => {
  renderWithApp(<GoalSetup />)
  expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  await userEvent.type(screen.getByPlaceholderText(/pass ifn637/i), 'Pass IFN637')
  expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
})
