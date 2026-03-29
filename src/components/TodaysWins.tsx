import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS } from '../lib/types'

const ICONS: Record<TaskDifficulty, string> = { poring: '🍄', orc: '👺', drake: '🐉', mvp: '💀' }

export default function TodaysWins() {
  const todaysWins = useStore((s) => s.todaysWins)
  if (todaysWins.length === 0) return null

  const totalXp = todaysWins.reduce((sum, t) => sum + t.xp_earned, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="font-semibold text-gray-900">Today's Wins</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: '#d1fae5', color: '#059669' }}>
          +{totalXp} XP
        </span>
      </div>
      <div className="border-t border-gray-50">
        <AnimatePresence initial={false}>
          {todaysWins.map((task) => {
            const diff = task.difficulty as TaskDifficulty
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 px-5 py-3 border-b border-gray-50"
              >
                <span className="flex-shrink-0 text-sm">{ICONS[diff] ?? '✓'}</span>
                <span className="flex-1 text-sm text-gray-400 line-through truncate">{task.title}</span>
                <span className="text-xs font-medium flex-shrink-0"
                  style={{ color: DIFFICULTY_COLORS[diff] ?? '#9ca3af' }}>
                  +{task.xp_earned}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
