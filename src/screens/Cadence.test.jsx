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

test('shows reassurance when "Whenever I can" is selected', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Whenever I can'))
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('shows reassurance when cadence is seeded as when_i_can', () => {
  renderWithApp(<Cadence />, { initialStateOverrides: { cadence: 'when_i_can' } })
  expect(screen.getByText(/Smart pick/)).toBeInTheDocument()
})

test('does not show reassurance for the default cadence', () => {
  renderWithApp(<Cadence />)
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})

test('does not show reassurance after selecting "Most days"', async () => {
  renderWithApp(<Cadence />)
  await userEvent.click(screen.getByText('Most days'))
  expect(screen.queryByText(/Smart pick/)).not.toBeInTheDocument()
})

test('renders the Locke & Latham science note', () => {
  renderWithApp(<Cadence />)
  expect(screen.getByText(/Locke & Latham/)).toBeInTheDocument()
})
