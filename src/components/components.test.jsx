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
  render(<CompleteControl actionId="a1" label="Write 400 words" count={0} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Write 400 words')).toBeInTheDocument()
})

test('repeatable: tapping calls onComplete with actionId', async () => {
  const onComplete = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" count={0} repeatable onComplete={onComplete} onUndo={() => {}} />)
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onComplete).toHaveBeenCalledWith('a1')
})

test('repeatable with count > 0 shows "done N×" and an undo that calls onUndo only', async () => {
  const onComplete = vi.fn()
  const onUndo = vi.fn()
  render(<CompleteControl actionId="a1" label="Write 400 words" count={3} repeatable onComplete={onComplete} onUndo={onUndo} />)
  expect(screen.getByText(/done 3×/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /undo one/i }))
  expect(onUndo).toHaveBeenCalledWith('a1')
  expect(onComplete).not.toHaveBeenCalled()
})

test('one-off: first tap completes, tap when done undoes (toggle)', async () => {
  const onComplete = vi.fn()
  const onUndo = vi.fn()
  const { rerender } = render(<CompleteControl actionId="a1" label="Submit draft" count={0} repeatable={false} onComplete={onComplete} onUndo={onUndo} />)
  await userEvent.click(screen.getByText('Submit draft'))
  expect(onComplete).toHaveBeenCalledWith('a1')
  rerender(<CompleteControl actionId="a1" label="Submit draft" count={1} repeatable={false} onComplete={onComplete} onUndo={onUndo} />)
  await userEvent.click(screen.getByText('Submit draft'))
  expect(onUndo).toHaveBeenCalledWith('a1')
})

test('CompleteControl has completed class on the circle when count > 0', () => {
  render(<CompleteControl actionId="a1" label="done" count={1} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByTestId('complete-circle')).toHaveClass('completed')
})

test('a finished one-off is struck through; a repeat is not', () => {
  const { rerender } = render(<CompleteControl actionId="a1" label="Submit draft" count={1} repeatable={false} onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Submit draft')).toHaveClass('labelDone')
  rerender(<CompleteControl actionId="a2" label="Write 400 words" count={1} repeatable onComplete={() => {}} onUndo={() => {}} />)
  expect(screen.getByText('Write 400 words')).not.toHaveClass('labelDone')
})
