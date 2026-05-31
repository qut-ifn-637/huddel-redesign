import { screen } from '@testing-library/react'
import { renderWithApp } from '../test/helpers'
import { useApp } from './AppContext'

function Probe() {
  const { state } = useApp()
  const m = state.milestones[0]
  const alex = state.supporting.find(p => p.name === 'Alex')
  return (
    <div>
      <span data-testid="td">{String(m.targetDate)}</span>
      <span data-testid="reached">{String(m.reached)}</span>
      <span data-testid="alex-slipped">{alex.slipped || ''}</span>
      <span data-testid="alex-struggle">{String(alex.struggleFlag)}</span>
    </div>
  )
}

test('default milestone has null targetDate and reached=false', () => {
  renderWithApp(<Probe />)
  expect(screen.getByTestId('td')).toHaveTextContent('null')
  expect(screen.getByTestId('reached')).toHaveTextContent('false')
})

test('demo supporter Alex has a slipped line and no struggleFlag', () => {
  renderWithApp(<Probe />)
  expect(screen.getByTestId('alex-slipped').textContent).toMatch(/slipped past/i)
  expect(screen.getByTestId('alex-struggle')).toHaveTextContent('undefined')
})
