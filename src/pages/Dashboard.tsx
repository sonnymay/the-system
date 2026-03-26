import { motion } from 'framer-motion'
import HunterCard from '../components/HunterCard'
import DailyQuests from '../components/DailyQuests'
import TaskList from '../components/TaskList'
import RankUpOverlay from '../components/RankUpOverlay'
import LevelUpToast from '../components/LevelUpToast'
import StreakMilestoneToast from '../components/StreakMilestoneToast'
import NamePrompt from '../components/NamePrompt'
import XpFloats from '../components/XpFloats'

export default function Dashboard() {
  return (
    <>
      <NamePrompt />
      <RankUpOverlay />
      <LevelUpToast />
      <StreakMilestoneToast />
      <XpFloats />

      <div className="min-h-screen" style={{ background: '#f5f5f7' }}>
        <div className="max-w-md mx-auto px-4 pt-8 pb-6 space-y-3">
          {/* App header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="px-1 pb-2"
          >
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">The System</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <HunterCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <DailyQuests />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <TaskList />
          </motion.div>
        </div>
      </div>
    </>
  )
}
