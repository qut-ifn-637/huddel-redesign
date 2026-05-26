import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Cadence from './Cadence'

test('renders headline verbatim', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText('How often feels realistic?')).toBeInTheDocument()
})

test('renders all four cadence options', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText('A few times a week')).toBeInTheDocument()
  expect(screen.getByText('Most days')).toBeInTheDocument()
  expect(screen.getByText('Specific days')).toBeInTheDocument()
  expect(screen.getByText('Whenever I can')).toBeInTheDocument()
})

test('"Specific days" reveals day picker when selected', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Specific days'))
  expect(screen.getByText('Mon')).toBeInTheDocument()
})

test('day picker does not appear when another option is selected', () => {
  renderWithApp(<Cadence />)
  expect(screen.queryByText('Mon')).not.toBeInTheDocument()
})

test('shows contextual reassurance when context is "both"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'both' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('shows contextual reassurance when context is "life_full"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'life_full' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('does not show contextual reassurance when context is "work"', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { context: 'work' } })
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})
