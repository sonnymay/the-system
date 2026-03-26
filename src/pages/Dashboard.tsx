import { motion } from 'framer-motion'
import HunterCard from '../components/HunterCard'
import DailyQuests from '../components/DailyQuests'
import RankUpOverlay from '../components/RankUpOverlay'
import XpFloats from '../components/XpFloats'

export default function Dashboard() {
  return (
    <>
      <RankUpOverlay />
      <XpFloats />

      <div className="min-h-screen" style={{ background: '#f5f5f7' }}>
        <div className="max-w-md mx-auto px-4 py-6 space-y-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <HunterCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <DailyQuests />
          </motion.div>
        </div>
      </div>
    </>
  )
}
