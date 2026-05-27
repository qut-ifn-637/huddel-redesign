import { useState } from 'react'
import SegmentedToggle from '../components/SegmentedToggle'
import MyHuddleView from './MyHuddleView'
import SupportingView from './SupportingView'

const OPTIONS = [
  { value: 'mine',       label: 'My huddle' },
  { value: 'supporting', label: 'Supporting' },
]

export default function HuddleScreen() {
  const [view, setView] = useState('mine')
  return (
    <div className="screenPad">
      <SegmentedToggle options={OPTIONS} value={view} onChange={setView} />
      {view === 'mine' ? <MyHuddleView /> : <SupportingView />}
    </div>
  )
}
