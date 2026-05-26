import { AppProvider, useApp } from './context/AppContext'
import Welcome from './screens/Welcome'
import GoalActions from './screens/GoalActions'
import Cadence from './screens/Cadence'
import OfferedSocial from './screens/OfferedSocial'
import Recognition from './screens/Recognition'
import ReturnView from './screens/ReturnView'
import styles from './App.module.css'

const SCREENS = {
  'welcome':        Welcome,
  'goal-actions':   GoalActions,
  'cadence':        Cadence,
  'offered-social': OfferedSocial,
  'recognition':    Recognition,
  'return-view':    ReturnView,
}

function Router() {
  const { currentScreen, fading } = useApp()
  const Screen = SCREENS[currentScreen]
  return (
    <div className={`screenWrapper ${fading ? 'fading' : ''}`}>
      <Screen />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
