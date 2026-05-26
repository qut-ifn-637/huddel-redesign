import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp } from '../test/helpers'
import Welcome from './Welcome'

test('renders headline and subhead verbatim', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByText("What's pulling at your time right now?")).toBeInTheDocument()
  expect(screen.getByText(/Huddel plans around real life/)).toBeInTheDocument()
})

test('renders all four option cards', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByText('Work')).toBeInTheDocument()
  expect(screen.getByText('Study')).toBeInTheDocument()
  expect(screen.getByText('Both work and study')).toBeInTheDocument()
  expect(screen.getByText("Life's just full right now")).toBeInTheDocument()
})

test('Continue button is disabled until an option is selected', () => {
  renderWithApp(<Welcome />)
  expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
})

test('Continue button enables after selecting an option', async () => {
  renderWithApp(<Welcome />)
  await userEvent.click(screen.getByText('Work'))
  expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
})

test('selecting one card deselects the other', async () => {
  renderWithApp(<Welcome />)
  await userEvent.click(screen.getByText('Work'))
  await userEvent.click(screen.getByText('Study'))
  expect(screen.getByRole('button', { name: /^Work$/i })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: /^Study$/i })).toHaveAttribute('aria-pressed', 'true')
})

test('does not contain the word milestone', () => {
  renderWithApp(<Welcome />)
  expect(document.body.textContent.toLowerCase()).not.toContain('milestone')
})
