import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SegmentedToggle from './SegmentedToggle'

const options = [{ value: 'a', label: 'First' }, { value: 'b', label: 'Second' }]

test('renders both segment labels', () => {
  render(<SegmentedToggle options={options} value="a" onChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument()
})

test('marks the selected segment active', () => {
  render(<SegmentedToggle options={options} value="b" onChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'Second' })).toHaveClass('active')
  expect(screen.getByRole('button', { name: 'First' })).not.toHaveClass('active')
})

test('calls onChange with the clicked value', async () => {
  const onChange = vi.fn()
  render(<SegmentedToggle options={options} value="a" onChange={onChange} />)
  await userEvent.click(screen.getByRole('button', { name: 'Second' }))
  expect(onChange).toHaveBeenCalledWith('b')
})
