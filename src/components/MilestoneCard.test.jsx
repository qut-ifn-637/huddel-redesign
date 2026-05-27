import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MilestoneCard from './MilestoneCard'

const emptyMilestone = { id: 'm1', name: '', actions: [] }
const filledMilestone = {
  id: 'm1',
  name: 'Research',
  actions: [{ id: 'a1', label: 'Read 3 sources', source: 'effort', completed: false }],
}

const noop = () => {}

function renderCard(overrides = {}) {
  const props = {
    milestone: emptyMilestone,
    expanded: false,
    onToggle: noop,
    onRename: noop,
    onAddAction: noop,
    onRemoveAction: noop,
    ...overrides,
  }
  return render(<MilestoneCard {...props} />)
}

test('renders an editable name input as the headline', () => {
  renderCard({ milestone: emptyMilestone })
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toBeInTheDocument()
})

test('the name input reflects the milestone name', () => {
  renderCard({ milestone: filledMilestone })
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toHaveValue('Research')
})

test('shows the placeholder when the name is empty', () => {
  renderCard({ milestone: emptyMilestone })
  expect(screen.getByPlaceholderText(/name this milestone/i)).toBeInTheDocument()
})

test('editing the name input calls onRename', async () => {
  const onRename = vi.fn()
  renderCard({ onRename })
  await userEvent.type(screen.getByRole('textbox', { name: /milestone name/i }), 'R')
  expect(onRename).toHaveBeenCalled()
})

test('the caret button calls onToggle', async () => {
  const onToggle = vi.fn()
  renderCard({ onToggle, expanded: false })
  await userEvent.click(screen.getByRole('button', { name: /show actions/i }))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('collapsed card hides the effort chips but keeps the name input', () => {
  renderCard({ expanded: false })
  expect(screen.queryByText('Write 400 words')).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: /milestone name/i })).toBeInTheDocument()
})

test('expanded card shows effort chips and adds an effort action on tap', async () => {
  const onAddAction = vi.fn()
  renderCard({ expanded: true, onAddAction })
  await userEvent.click(screen.getByText('Write 400 words'))
  expect(onAddAction).toHaveBeenCalledWith('Write 400 words', 'effort')
})

test('expanded card lists existing actions and removes them', async () => {
  const onRemoveAction = vi.fn()
  renderCard({ milestone: filledMilestone, expanded: true, onRemoveAction })
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

test('expanded card shows the Pham & Taylor science note', () => {
  renderCard({ expanded: true })
  expect(screen.getByText(/Pham & Taylor/)).toBeInTheDocument()
})
