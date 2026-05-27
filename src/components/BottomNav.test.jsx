import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import BottomNav from './BottomNav'

test('renders the three tabs', () => {
  renderWithApp(<BottomNav />)
  expect(screen.getByRole('button', { name: /goals/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /huddle/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /cheers/i })).toBeInTheDocument()
})

test('marks the active tab with the active class', () => {
  renderWithApp(<BottomNav />)
  expect(screen.getByRole('button', { name: /goals/i })).toHaveClass('active')
  expect(screen.getByRole('button', { name: /huddle/i })).not.toHaveClass('active')
})

test('tapping a tab switches the active tab', async () => {
  renderWithApp(<BottomNav />)
  await userEvent.click(screen.getByRole('button', { name: /huddle/i }))
  expect(screen.getByRole('button', { name: /huddle/i })).toHaveClass('active')
})
