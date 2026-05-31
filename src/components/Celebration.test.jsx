import { render, screen, act } from '@testing-library/react'
import Celebration from './Celebration'

test('renders the cheer text and 12 confetti particles', () => {
  const { container } = render(<Celebration onDone={() => {}} />)
  expect(screen.getByText('Milestone reached 🎉')).toBeInTheDocument()
  expect(container.querySelectorAll('.particle')).toHaveLength(12)
})

test('calls onDone after the celebration finishes', () => {
  vi.useFakeTimers()
  const onDone = vi.fn()
  render(<Celebration onDone={onDone} />)
  expect(onDone).not.toHaveBeenCalled()
  act(() => { vi.advanceTimersByTime(1900) })
  expect(onDone).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})
