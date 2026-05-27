import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the goal-setup screen on load', () => {
  render(<App />)
  expect(screen.getByText('Huddel')).toBeInTheDocument()
  expect(screen.getByText('What are you working toward?')).toBeInTheDocument()
})
