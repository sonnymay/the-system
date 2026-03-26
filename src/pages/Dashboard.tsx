import { motion } from 'framer-motion'
import HunterCard from '../components/HunterCard'
import DailyQuests from '../components/DailyQuests'
import TaskList from '../components/TaskList'
import RankUpOverlay from '../components/RankUpOverlay'
import XpFloats from '../components/XpFloats'

export default function Dashboard() {
  return (
    <>
      <RankUpOverlay />
      <XpFloats />

      <div className="min-h-screen" style={{ background: '#08080e' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <span className="text-xs font-semibold tracking-widest" style={{ color: '#252530' }}>
            THE SYSTEM
          </span>
        </div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <HunterCard />
          <div className="mx-6 mb-6" style={{ height: 1, background: '#0f0f18' }} />
          <DailyQuests />
          <div className="mx-6 my-6" style={{ height: 1, background: '#0f0f18' }} />
          <TaskList />
        </motion.div>
      </div>
    </>
  )
}
