import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import EncouragementsScreen from './EncouragementsScreen'

test('Received shows seeded messages and the calm footnote', () => {
  renderWithApp(<EncouragementsScreen />)
  expect(screen.getByText(/So proud of you for sticking with it/)).toBeInTheDocument()
  expect(screen.getByText(/Priya · 2h ago/)).toBeInTheDocument()
  expect(screen.getByText('No counts. No streaks. Just the words.')).toBeInTheDocument()
})

test('Sent is empty by default with a gentle prompt', async () => {
  renderWithApp(<EncouragementsScreen />)
  await userEvent.click(screen.getByRole('tab', { name: /sent/i }))
  expect(screen.getByText('Nothing sent yet. Cheer someone from Supporting.')).toBeInTheDocument()
})

test('Sent lists messages the user has sent', async () => {
  renderWithApp(<EncouragementsScreen />, { initialStateOverrides: {
    encouragements: { received: [], sent: [{ id: 'st1', to: 'Sam', message: 'Keep going!', when: 'just now' }] },
  } })
  await userEvent.click(screen.getByRole('tab', { name: /sent/i }))
  expect(screen.getByText(/Keep going!/)).toBeInTheDocument()
  expect(screen.getByText(/To Sam · just now/)).toBeInTheDocument()
})

test('Received empty shows a gentle prompt and no footnote', () => {
  renderWithApp(<EncouragementsScreen />, { initialStateOverrides: {
    encouragements: { received: [], sent: [] },
  } })
  expect(screen.getByText('Nothing yet — encouragement from your huddle shows up here.')).toBeInTheDocument()
  expect(screen.queryByText('No counts. No streaks. Just the words.')).not.toBeInTheDocument()
})
