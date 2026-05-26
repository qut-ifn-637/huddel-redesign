import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrimaryButton from './PrimaryButton'
import SkipButton from './SkipButton'
import OptionCard from './OptionCard'

// PrimaryButton
test('PrimaryButton renders label and calls onClick', async () => {
  const onClick = vi.fn()
  render(<PrimaryButton onClick={onClick}>Continue</PrimaryButton>)
  await userEvent.click(screen.getByRole('button', { name: /continue/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('PrimaryButton is disabled when disabled prop is true', async () => {
  const onClick = vi.fn()
  render(<PrimaryButton disabled onClick={onClick}>Continue</PrimaryButton>)
  const btn = screen.getByRole('button', { name: /continue/i })
  expect(btn).toBeDisabled()
  await userEvent.click(btn)
  expect(onClick).not.toHaveBeenCalled()
})

// SkipButton
test('SkipButton renders label and calls onClick', async () => {
  const onClick = vi.fn()
  render(<SkipButton onClick={onClick}>Skip for now</SkipButton>)
  await userEvent.click(screen.getByRole('button', { name: /skip for now/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

// OptionCard
test('OptionCard renders label', () => {
  render(<OptionCard label="Work" selected={false} onSelect={() => {}} />)
  expect(screen.getByText('Work')).toBeInTheDocument()
})

test('OptionCard calls onSelect when clicked', async () => {
  const onSelect = vi.fn()
  render(<OptionCard label="Work" selected={false} onSelect={onSelect} />)
  await userEvent.click(screen.getByText('Work'))
  expect(onSelect).toHaveBeenCalledTimes(1)
})

test('OptionCard has aria-pressed true when selected', () => {
  render(<OptionCard label="Work" selected={true} onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: /work/i })).toHaveAttribute('aria-pressed', 'true')
})

import CompleteControl from './CompleteControl'

// CompleteControl
test('CompleteControl renders the action label', () => {
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={false} onComplete={() => {}} />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('CompleteControl calls onComplete with actionId when tapped', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={false} onComplete={onComplete} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).toHaveBeenCalledWith('a1')
})

test('CompleteControl does not call onComplete when already completed', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" completed={true} onComplete={onComplete} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).not.toHaveBeenCalled()
})

test('CompleteControl has completed class when completed is true', () => {
  render(<CompleteControl actionId="a1" label="done" completed={true} onComplete={() => {}} />)
  // The circle element has data-testid="complete-circle"
  expect(screen.getByTestId('complete-circle')).toHaveClass('completed')
})
