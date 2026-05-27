import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EncouragementSheet from './EncouragementSheet'

const baseProps = {
  person: { name: 'Sam' },
  contextLine: 'Cheer Sam — Just finished chapter 2',
  presets: ['Proud of you 💜', 'Keep going!', "You've got this"],
}

test('shows the context line and presets', () => {
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={() => {}} />)
  expect(screen.getByText('Cheer Sam — Just finished chapter 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Keep going!' })).toBeInTheDocument()
})

test('send is disabled until a preset is chosen or text entered', async () => {
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={() => {}} />)
  expect(screen.getByRole('button', { name: /send to sam/i })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Keep going!' }))
  expect(screen.getByRole('button', { name: /send to sam/i })).toBeEnabled()
})

test('sending calls onSend with the chosen message', async () => {
  const onSend = vi.fn()
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={onSend} />)
  await userEvent.click(screen.getByRole('button', { name: 'Proud of you 💜' }))
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(onSend).toHaveBeenCalledWith('Proud of you 💜')
})

test('free text overrides the preset as the sent message', async () => {
  const onSend = vi.fn()
  render(<EncouragementSheet {...baseProps} onClose={() => {}} onSend={onSend} />)
  await userEvent.type(screen.getByPlaceholderText(/add your own words/i), 'You inspire me')
  await userEvent.click(screen.getByRole('button', { name: /send to sam/i }))
  expect(onSend).toHaveBeenCalledWith('You inspire me')
})
