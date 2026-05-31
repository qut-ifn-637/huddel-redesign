import { render, screen } from '@testing-library/react'
import OnboardingProgress from './OnboardingProgress'

test('renders the visible "Step N of 4" label for the given step', () => {
  render(<OnboardingProgress step={2} />)
  expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
})

test('exposes the step as an accessible label on the container', () => {
  render(<OnboardingProgress step={3} />)
  expect(screen.getByLabelText('Step 3 of 4')).toBeInTheDocument()
})

test('renders four dots total, with `step` of them filled', () => {
  const { container } = render(<OnboardingProgress step={2} />)
  expect(container.querySelectorAll('.dot')).toHaveLength(4)
  expect(container.querySelectorAll('.dotFilled')).toHaveLength(2)
})

test('fills all four dots on the last step', () => {
  const { container } = render(<OnboardingProgress step={4} />)
  expect(container.querySelectorAll('.dotFilled')).toHaveLength(4)
})
