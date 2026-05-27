import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import SupportingView from './SupportingView'

test('renders all three seeded people by role', () => {
  renderWithApp(<SupportingView />)
  expect(screen.getByText('Alex')).toBeInTheDocument()
  expect(screen.getByText('Sam')).toBeInTheDocument()
  expect(screen.getByText('Jordan')).toBeInTheDocument()
  expect(screen.getByText(/You see what each person chose to share/i)).toBeInTheDocument()
})

test('cheering opens the sheet, and sending shows a confirmation', async () => {
  renderWithApp(<SupportingView />)
  await userEvent.click(screen.getByRole('button', { name: /cheer this win/i }))
  expect(screen.getByText(/Cheer Sam/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Keep going!' }))
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(screen.getByText('Sent to Sam.')).toBeInTheDocument()
})

test('check-in on an Everything supporter offers the Thinking of you preset', async () => {
  renderWithApp(<SupportingView />)
  await userEvent.click(screen.getByRole('button', { name: /check in/i }))
  expect(screen.getByText(/Check in with Alex/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Thinking of you' })).toBeInTheDocument()
})
