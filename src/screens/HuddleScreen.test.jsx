import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import HuddleScreen from './HuddleScreen'

const state = { supporters: [{ id: 's1', name: 'Priya', role: 'all' }] }

test('defaults to My huddle and shows supporters', () => {
  renderWithApp(<HuddleScreen />, { initialStateOverrides: state })
  expect(screen.getByRole('tab', { name: /my huddle/i })).toHaveClass('active')
  expect(screen.getByText('Priya')).toBeInTheDocument()
})

test('switching to Supporting shows the people you support', async () => {
  renderWithApp(<HuddleScreen />, { initialStateOverrides: state })
  await userEvent.click(screen.getByRole('tab', { name: /supporting/i }))
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText(/You see what each person chose to share/i)).toBeInTheDocument()
})
