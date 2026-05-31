import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import OfferedSocial from './OfferedSocial'

test('renders the warmer connective heading', () => {
  renderWithApp(<OfferedSocial />)
  expect(
    screen.getByText('Almost there — want someone in your corner?')
  ).toBeInTheDocument()
})

test('no longer shows the old heading', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.queryByText('Want a supporter in your corner?')).not.toBeInTheDocument()
})

test('shows the progress indicator on step 4', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
})

test('renders a back control', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
})

test('"Done — continue" button is always visible and enabled', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /done — continue/i })).not.toBeDisabled()
})

test('"Skip for now" button is always visible', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
})

test('skipping does not crash', async () => {
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByRole('button', { name: /skip for now/i }))
})

test('Progress is selected by default (its description shows on load)', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText(/never the hard days/i)).toBeInTheDocument()
})

test('the Progress chip shows a Recommended tag', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Recommended')).toBeInTheDocument()
})

test('renders the Klein respected-supporter nudge', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText(/Klein/)).toBeInTheDocument()
})

test('selecting a different role chip updates the visibility description', async () => {
  renderWithApp(<OfferedSocial />)
  await userEvent.click(screen.getByText('Everything'))
  expect(screen.getByText(/partner or close friend/i)).toBeInTheDocument()
})

test('renders a header for the roles section', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('What will they see?')).toBeInTheDocument()
})

test('role chips: all three options render', () => {
  renderWithApp(<OfferedSocial />)
  expect(screen.getByText('Everything')).toBeInTheDocument()
  expect(screen.getByText('Progress')).toBeInTheDocument()
  expect(screen.getByText('Goal only')).toBeInTheDocument()
  expect(screen.queryByText('Just this goal')).not.toBeInTheDocument()
})
