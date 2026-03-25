import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import HunterCard from '../components/HunterCard'
import DailyQuests from '../components/DailyQuests'
import TaskList from '../components/TaskList'
import RankUpOverlay from '../components/RankUpOverlay'
import XpFloats from '../components/XpFloats'

export default function Dashboard() {
  const fetchProfile = useStore((s) => s.fetchProfile)
  const fetchTasks = useStore((s) => s.fetchTasks)
  const fetchDailyQuests = useStore((s) => s.fetchDailyQuests)

  useEffect(() => {
    fetchProfile()
    fetchTasks()
    fetchDailyQuests()
  }, [fetchProfile, fetchTasks, fetchDailyQuests])

  return (
    <>
      <RankUpOverlay />
      <XpFloats />

      <div className="min-h-screen" style={{ background: '#08080e' }}>
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <span className="text-xs font-semibold tracking-widest" style={{ color: '#252530' }}>
            THE SYSTEM
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs transition-opacity hover:opacity-60"
            style={{ color: '#303040' }}
          >
            sign out
          </button>
        </div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <HunterCard />

          {/* Divider */}
          <div className="mx-6 mb-6" style={{ height: 1, background: '#0f0f18' }} />

          <DailyQuests />

          <div className="mx-6 my-6" style={{ height: 1, background: '#0f0f18' }} />

          <TaskList />
        </motion.div>
      </div>
    </>
  )
}
