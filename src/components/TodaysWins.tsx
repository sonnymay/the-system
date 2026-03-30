import { AnimatePresence, motion } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS } from '../lib/types'
import { useTheme } from '../lib/theme'

const TASK_ICONS: Record<TaskDifficulty, string> = { poring: '🍄', orc: '👺', drake: '🐉', mvp: '💀' }

export default function TodaysWins() {
  const todaysWins = useStore((s) => s.todaysWins)
  const quests = useStore((s) => s.quests)
  const undoCompletion = useStore((s) => s.undoCompletion)
  const t = useTheme()

  if (todaysWins.length === 0) return null

  const totalXp = todaysWins.reduce((sum, item) => sum + item.xp_earned, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{ background: t.card }}
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="font-semibold" style={{ color: t.text }}>Today's Wins</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: '#d1fae5', color: '#059669' }}>
          +{totalXp} XP
        </span>
      </div>
      <div className="border-t" style={{ borderColor: t.border }}>
        <AnimatePresence initial={false}>
          {todaysWins.map((item) => {
            const isHabit = item.difficulty === 'habit'
            const isChallenge = item.difficulty === 'challenge'
            const questEmoji = isHabit ? (quests.find((q) => q.id === item.questId)?.emoji ?? '✅') : null
            const icon = isHabit ? questEmoji : isChallenge ? '⚡' : (TASK_ICONS[item.difficulty as TaskDifficulty] ?? '✓')
            const color = isHabit ? '#10b981' : isChallenge ? '#f59e0b' : (DIFFICULTY_COLORS[item.difficulty as TaskDifficulty] ?? '#9ca3af')

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-4 py-2.5 border-b"
                style={{ borderColor: t.border }}
              >
                <span className="flex-shrink-0 text-sm">{icon}</span>
                <span className="flex-1 text-sm truncate" style={{ color: t.textMuted, textDecoration: 'line-through' }}>
                  {item.title}
                </span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color }}>
                  +{item.xp_earned}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => undoCompletion(item.id)}
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
                  style={{ color: t.textMuted, background: t.cardAlt }}
                  title="Undo"
                >
                  <Undo2 size={11} />
                </motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
