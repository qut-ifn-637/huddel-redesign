import { useApp } from '../context/AppContext'
import styles from './BottomNav.module.css'

const TABS = [
  { value: 'goals',          label: 'Goals',  icon: '◆' },
  { value: 'huddle',         label: 'Huddle', icon: '○' },
  { value: 'encouragements', label: 'Cheers', icon: '♡' },
]

export default function BottomNav() {
  const { activeTab, setTab } = useApp()
  return (
    <nav className={styles.nav}>
      {TABS.map(tab => (
        <button
          key={tab.value}
          type="button"
          className={`${styles.tab} ${activeTab === tab.value ? 'active' : ''}`}
          onClick={() => setTab(tab.value)}
        >
          <span className={styles.icon} aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
