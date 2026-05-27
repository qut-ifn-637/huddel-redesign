import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StepCard from './StepCard'

const emptyStep = { id: 's1', name: '', actions: [] }
const filledStep = {
  id: 's1',
  name: 'Research',
  actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }],
}

const noop = () => {}

function renderCard(overrides = {}) {
  const props = {
    step: emptyStep,
    position: 1,
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    ...overrides,
  }
  return render(<StepCard {...props} />)
}

test('shows "Step N" in the header when name is empty', () => {
  renderCard({ step: emptyStep, position: 1 })
  expect(screen.getByText('Step 1')).toBeInTheDocument()
})

test('shows the step name in the header when provided', () => {
  renderCard({ step: filledStep, position: 2 })
  expect(screen.getByText('Research')).toBeInTheDocument()
})

test('clicking the header calls onToggle', async () => {
  const onToggle = vi.fn()
  renderCard({ onToggle })
  await userEvent.click(screen.getByText('Step 1'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('collapsed card hides the effort chips', () => {
  renderCard({ expanded: false })
  expect(screen.queryByText('Write 400 words')).not.toBeInTheDocument()
})

test('expanded card shows effort chips and adds an effort action on tap', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onAddAction).toHaveBeenCalledWith('Write 400 words', 'effort')
})

test('expanded card lists existing actions and removes them', async () => {
  const onRemoveAction = vi.fn()
  renderCard({ step: filledStep, expanded: true, onRemoveAction })
  expect(screen.getByText('Read 3 sources')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /remove read 3 sources/i }))
  expect(onRemoveAction).toHaveBeenCalledWith('a1')
})

test('custom action submits with source "custom"', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('+ Write my own'))
  await userEvent.type(screen.getByPlaceholderText(/describe your action/i), 'Outline intro')
  await userEvent.click(screen.getByRole('button', { name: /^add$/i }))
  expect(onAddAction).toHaveBeenCalledWith('Outline intro', 'custom')
})

test('editing the name field calls onRename', async () => {
  const onRename = vi.fn()
  renderCard({ expanded: true, onRename })
  await userEvent.type(screen.getByPlaceholderText(/name this step/i), 'R')
  expect(onRename).toHaveBeenCalled()
})

test('does not contain the word milestone', () => {
  renderCard({ step: filledStep, expanded: true })
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
