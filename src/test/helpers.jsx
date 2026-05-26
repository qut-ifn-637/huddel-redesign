import { render } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'

export function renderWithApp(ui, { initialStateOverrides = {} } = {}) {
  return render(
    <AppProvider initialStateOverrides={initialStateOverrides}>
      {ui}
    </AppProvider>
  )
}
