import { createContext, useContext, useState } from 'react'

const defaultState = {
  goalName: '',
  milestones: [
    { id: 'milestone-1', name: '', actions: [] },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
}

const AppContext = createContext(null)

export function allActions(milestones) {
  return milestones.flatMap(m => m.actions)
}

export function AppProvider({ children, initialStateOverrides = {} }) {
  const [state, setState] = useState({ ...defaultState, ...initialStateOverrides })
  const [currentScreen, setCurrentScreen] = useState('goal')
  const [fading, setFading] = useState(false)

  function goTo(screenId) {
    setFading(true)
    setTimeout(() => {
      setCurrentScreen(screenId)
      setFading(false)
    }, 150)
  }

  function updateState(updates) {
    setState(prev => ({ ...prev, ...updates }))
  }

  return (
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, updateState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
