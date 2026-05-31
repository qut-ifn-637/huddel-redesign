import { createContext, useContext, useState } from 'react'

const DEMO_SUPPORTERS = [
  { id: 'sup-1', name: 'Priya', role: 'all' },
  { id: 'sup-2', name: 'Mum',   role: 'progress' },
]

const defaultState = {
  goalName: '',
  milestones: [
    { id: 'milestone-1', name: '', actions: [], targetDate: null, reached: false },
  ],
  cadence: 'few_times_week',
  cadenceDays: [],
  supporters: [],
  returnTo: null,
  supporting: [
    { id: 'sg-1', name: 'Alex',   role: 'all',          goal: 'Run a half-marathon', progress: '3 of 5 runs this week', slipped: '"Long run" slipped past 20 May' },
    { id: 'sg-2', name: 'Sam',    role: 'progress',      win: 'Just finished chapter 2' },
    { id: 'sg-3', name: 'Jordan', role: 'availability',  status: 'Busy this week' },
  ],
  encouragements: {
    received: [
      { id: 'enc-1', from: 'Priya', message: 'So proud of you for sticking with it 💜', when: '2h ago' },
      { id: 'enc-2', from: 'Mum',   message: 'Saw you did your writing today!',          when: 'yesterday' },
    ],
    sent: [],
  },
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
  const [inApp, setInApp] = useState(false)
  const [activeTab, setActiveTab] = useState('goals')

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

  function enterApp() {
    setState(prev => (prev.supporters.length ? prev : { ...prev, supporters: DEMO_SUPPORTERS }))
    setActiveTab('goals')
    setInApp(true)
  }

  function setTab(tab) {
    setActiveTab(tab)
  }

  function sendEncouragement({ toName, message }) {
    setState(prev => ({
      ...prev,
      encouragements: {
        ...prev.encouragements,
        sent: [
          ...prev.encouragements.sent,
          { id: `sent-${prev.encouragements.sent.length + 1}`, to: toName, message, when: 'just now' },
        ],
      },
    }))
  }

  const canGoBack = history.length > 0

  return (
    <AppContext.Provider value={{ state, currentScreen, fading, goTo, goBack, canGoBack, updateState, inApp, activeTab, enterApp, setTab, sendEncouragement }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
