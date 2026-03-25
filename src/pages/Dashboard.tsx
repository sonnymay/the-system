import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
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

      <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
        {/* Minimal nav */}
        <header className="sticky top-0 z-30 flex items-center px-5 h-14"
          style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #111118' }}>
          <span className="text-sm font-semibold text-white">The System</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-auto p-2 rounded-lg transition-colors hover:opacity-60"
            style={{ color: '#555570' }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </header>

        <main className="max-w-md mx-auto px-4 py-5 space-y-3 pb-16">
          {(['card', 'quests', 'tasks'] as const).map((section, i) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              {section === 'card' && <HunterCard />}
              {section === 'quests' && <DailyQuests />}
              {section === 'tasks' && <TaskList />}
            </motion.div>
          ))}
        </main>
      </div>
    </>
  )
}
