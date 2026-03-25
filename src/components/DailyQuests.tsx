import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, Flame, Target, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function DailyQuests() {
  const dailyQuests = useStore((s) => s.dailyQuests)
  const addDailyQuest = useStore((s) => s.addDailyQuest)
  const completeDailyQuest = useStore((s) => s.completeDailyQuest)
  const deleteDailyQuest = useStore((s) => s.deleteDailyQuest)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)

  const completedCount = dailyQuests.filter((q) => q.completed_today).length
  const canAdd = dailyQuests.length < 3

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    setAdding(true)
    await addDailyQuest(newText.trim())
    setNewText('')
    setAdding(false)
  }

  // Check for missed streaks (streak is 0 but was previously > 0 could indicate recovery needed)
  const needsRecovery = dailyQuests.some((q) => {
    if (!q.last_completed_at) return false
    const last = new Date(q.last_completed_at)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000)
    return diffDays >= 2 && q.current_streak === 0
  })

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#12121a', border: '1px solid #2a2a3f' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a3f' }}>
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} style={{ color: '#ef4444' }} />
          <h3 className="font-semibold text-sm text-white">Daily Quests</h3>
          <div className="ml-auto flex items-center gap-1.5">
            {dailyQuests.length > 0 && (
              <span className="text-xs" style={{ color: '#6b7280' }}>
                {completedCount}/{dailyQuests.length}
              </span>
            )}
            {isPerfectDay && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}
              >
                ✨ Perfect Day!
              </motion.span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {dailyQuests.length > 0 && (
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a27' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isPerfectDay ? '#f59e0b' : '#ef4444' }}
              animate={{ width: `${(completedCount / dailyQuests.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Recovery notice */}
      <AnimatePresence>
        {needsRecovery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 py-3 flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertTriangle size={14} style={{ color: '#ef4444' }} />
            <p className="text-xs" style={{ color: '#ef4444' }}>
              Streak broken! Complete today's quests to begin your recovery.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest list */}
      <div className="divide-y" style={{ borderColor: '#1a1a27' }}>
        <AnimatePresence initial={false}>
          {dailyQuests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-3.5 flex items-center gap-3"
            >
              {/* Checkbox */}
              <button
                onClick={() => !quest.completed_today && completeDailyQuest(quest.id)}
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: quest.completed_today ? '#10b981' : '#1a1a27',
                  border: `2px solid ${quest.completed_today ? '#10b981' : '#2a2a3f'}`,
                  cursor: quest.completed_today ? 'default' : 'pointer',
                }}
              >
                {quest.completed_today && <Check size={12} className="text-white" />}
              </button>

              {/* Quest text */}
              <span
                className="flex-1 text-sm min-w-0 truncate"
                style={{
                  color: quest.completed_today ? '#4b5563' : '#e2e8f0',
                  textDecoration: quest.completed_today ? 'line-through' : 'none',
                }}
              >
                {quest.quest_text}
              </span>

              {/* Streak */}
              {quest.current_streak > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Flame size={12} style={{ color: '#ef4444' }} />
                  <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                    {quest.current_streak}
                  </span>
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteDailyQuest(quest.id)}
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: '#6b7280' }}
              >
                <Trash2 size={11} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add quest form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="px-5 py-3" style={{ borderTop: dailyQuests.length > 0 ? '1px solid #1a1a27' : 'none' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={`Add daily habit (${dailyQuests.length}/3)...`}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: '#1a1a27', border: '1px solid #2a2a3f', color: '#e2e8f0' }}
              onFocus={(e) => (e.target.style.borderColor = '#ef4444')}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a3f')}
            />
            <button
              type="submit"
              disabled={!newText.trim() || adding}
              className="px-3 py-2 rounded-xl transition-all"
              style={{ background: newText.trim() ? '#ef4444' : '#2a2a3f', color: 'white' }}
            >
              <Plus size={15} />
            </button>
          </div>
        </form>
      )}

      {!canAdd && dailyQuests.length === 3 && (
        <div className="px-5 py-3 text-center">
          <p className="text-xs" style={{ color: '#4b5563' }}>3 daily quests set — complete them all for 2× XP bonus!</p>
        </div>
      )}
    </div>
  )
}
