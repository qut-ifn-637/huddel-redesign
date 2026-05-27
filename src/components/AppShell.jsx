import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import ReturnView from '../screens/ReturnView'
import HuddleScreen from '../screens/HuddleScreen'
import EncouragementsScreen from '../screens/EncouragementsScreen'
import styles from './AppShell.module.css'

const TABS = {
  goals:          ReturnView,
  huddle:         HuddleScreen,
  encouragements: EncouragementsScreen,
}

export default function AppShell() {
  const { activeTab } = useApp()
  const Tab = TABS[activeTab] || ReturnView
  return (
    <div className={`appShell ${styles.asShell}`}>
      <Tab />
      <BottomNav />
    </div>
  )
}
