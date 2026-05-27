import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the goal screen on load', () => {
  render(<App />)
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})

test('does not contain the word "milestone" anywhere on initial load', () => {
  render(<App />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
