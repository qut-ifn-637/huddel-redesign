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
  const [history, setHistory] = useState([])
  const [fading, setFading] = useState(false)

  function navigate(screenId) {
    setFading(true)
    setTimeout(() => {
      setCurrentScreen(screenId)
      setFading(false)
    }, 150)
  }

  function goTo(screenId) {
    setHistory(h => [...h, currentScreen])
    navigate(screenId)
  }

  function goBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    navigate(prev)
  }

  function updateState(updates) {
    setState(prev => ({ ...prev, ...updates }))
  }

  const canGoBack = history.length > 0

  return (
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, goBack, canGoBack, updateState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
