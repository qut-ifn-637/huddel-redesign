import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import AppShell from './AppShell'

const state = { goalName: 'Finish my essay', supporters: [{ id: 's1', name: 'Priya', role: 'all' }] }

test('renders the Goals tab (home base) by default with the bottom nav', () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  expect(screen.getByText('Welcome back.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /goals/i })).toBeInTheDocument()
})

test('switching to the Huddle tab shows the huddle content', async () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('button', { name: /huddle/i }))
  // text-based so it holds against both the Task-4 stub and the Task-10 component
  expect(screen.getByText('Supporting')).toBeInTheDocument()
})

test('switching to the Cheers tab shows the encouragements inbox', async () => {
  renderWithApp(<AppShell />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('button', { name: /cheers/i }))
  expect(screen.getByText('Encouragements')).toBeInTheDocument()
})
