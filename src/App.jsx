import { AppProvider, useApp } from './context/AppContext'
import GoalSetup from './screens/GoalSetup'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import AppShell from './components/AppShell'

const SCREENS = {
  'goal':           GoalSetup,
  'goal-actions':   GoalActions,
  'cadence':        Cadence,
  'offered-social': OfferedSocial,
  'recognition':    Recognition,
}

function OnboardingRouter() {
  const { currentScreen, fading } = useApp()
  const Screen = SCREENS[currentScreen]
  return (
    <div className={`screenWrapper ${fading ? 'fading' : ''}`}>
      <Screen />
    </div>
  )
}

function Root() {
  const { inApp } = useApp()
  return inApp ? <AppShell /> : <OnboardingRouter />
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
