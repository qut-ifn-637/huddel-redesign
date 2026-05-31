import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import MyHuddleView from './MyHuddleView'

const withSupporters = { supporters: [
  { id: 's1', name: 'Priya', role: 'all' },
  { id: 's2', name: 'Mum',   role: 'progress' },
] }

test('lists supporters with what each one sees', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: withSupporters })
  expect(screen.getByText('Priya')).toBeInTheDocument()
  expect(screen.getByText('Mum')).toBeInTheDocument()
  expect(screen.getByText(/sees your goal and your wins/i)).toBeInTheDocument()
})

test('shows the calm subhead', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: withSupporters })
  expect(screen.getByText('You choose what each one sees.')).toBeInTheDocument()
})

test('empty state is gentle', () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: { supporters: [] } })
  expect(screen.getByText(/No one yet — and that's completely fine\./i)).toBeInTheDocument()
})

test('inline add appends a supporter', async () => {
  renderWithApp(<MyHuddleView />, { initialStateOverrides: { supporters: [] } })
  await userEvent.click(screen.getByRole('button', { name: /\+ Add someone/i }))
  await userEvent.type(screen.getByPlaceholderText('Name or contact'), 'Sky')
  await userEvent.click(screen.getByRole('button', { name: 'Progress' }))
  await userEvent.click(screen.getByRole('button', { name: /^Add$/ }))
  expect(screen.getByText('Sky')).toBeInTheDocument()
})
