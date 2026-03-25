import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Sword } from 'lucide-react'
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
  const profile = useStore((s) => s.profile)

  useEffect(() => {
    fetchProfile()
    fetchTasks()
    fetchDailyQuests()
  }, [fetchProfile, fetchTasks, fetchDailyQuests])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <RankUpOverlay />
      <XpFloats />

      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%)' }}>
        {/* Top nav */}
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a27' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Sword size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white">The System</span>
          </div>

          {profile && (
            <span className="text-xs ml-1" style={{ color: '#6b7280' }}>
              Lv.{profile.level} {profile.hunter_rank}-Rank
            </span>
          )}

          <button
            onClick={handleSignOut}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: '#6b7280', background: '#1a1a27' }}
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </header>

        {/* Main content */}
        <main className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HunterCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <DailyQuests />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <TaskList />
          </motion.div>
        </main>
      </div>
    </>
  )
}
