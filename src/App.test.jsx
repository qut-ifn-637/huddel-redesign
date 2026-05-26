import { render, screen } from '@testing-library/react'
import App from './App'

// App renders AppProvider internally; no wrapper needed here.

test('renders Welcome screen on load', () => {
  render(<App />)
  expect(screen.getByText("What's pulling at your time right now?")).toBeInTheDocument()
})

test('does not contain the word "milestone" anywhere on initial load', () => {
  render(<App />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
