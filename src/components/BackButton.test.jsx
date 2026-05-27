import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackButton from './BackButton'

test('renders a back control', () => {
  render(<BackButton onClick={() => {}} />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})

test('calls onClick when clicked', async () => {
  const onClick = vi.fn()
  render(<BackButton onClick={onClick} />)
  await userEvent.click(screen.getByRole('button', { name: /go back/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})
