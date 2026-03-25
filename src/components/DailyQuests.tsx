import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Flame, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function DailyQuests() {
  const dailyQuests = useStore((s) => s.dailyQuests)
  const addDailyQuest = useStore((s) => s.addDailyQuest)
  const completeDailyQuest = useStore((s) => s.completeDailyQuest)
  const deleteDailyQuest = useStore((s) => s.deleteDailyQuest)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const canAdd = dailyQuests.length < 3

  const completedCount = dailyQuests.filter((q) => q.completed_today).length

  const needsRecovery = dailyQuests.some((q) => {
    if (!q.last_completed_at) return false
    const diffDays = Math.floor(
      (new Date().getTime() - new Date(q.last_completed_at).getTime()) / 86400000
    )
    return diffDays >= 2 && q.current_streak === 0
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    setAdding(true)
    await addDailyQuest(newText.trim())
    setNewText('')
    setAdding(false)
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#111118', border: '1px solid #1e1e2e' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <h3 className="text-sm font-semibold text-white flex-1">Daily Habits</h3>

        {dailyQuests.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex gap-1">
              {dailyQuests.map((q) => (
                <div
                  key={q.id}
                  className="w-2 h-2 rounded-full transition-colors duration-300"
                  style={{ background: q.completed_today ? '#10b981' : '#1e1e2e' }}
                />
              ))}
            </div>
            {isPerfectDay && (
              <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>✦ 2× XP</span>
            )}
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
            style={{ background: '#ef444410', borderBottom: '1px solid #ef444420' }}
          >
            <AlertTriangle size={13} style={{ color: '#ef4444' }} />
            <p className="text-xs" style={{ color: '#ef4444' }}>
              Streak lost — complete today's habits to recover
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quests */}
      <AnimatePresence initial={false}>
        {dailyQuests.map((quest, i) => (
          <motion.div
            key={quest.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: i < dailyQuests.length - 1 || canAdd ? '1px solid #1a1a28' : 'none' }}
          >
            {/* Tap-to-complete circle */}
            <button
              onClick={() => !quest.completed_today && completeDailyQuest(quest.id)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all"
              style={{
                background: quest.completed_today ? '#10b981' : 'transparent',
                border: `2px solid ${quest.completed_today ? '#10b981' : '#333350'}`,
                cursor: quest.completed_today ? 'default' : 'pointer',
              }}
            >
              {quest.completed_today && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <span
              className="flex-1 text-sm truncate"
              style={{
                color: quest.completed_today ? '#444460' : '#e2e8f0',
                textDecoration: quest.completed_today ? 'line-through' : 'none',
              }}
            >
              {quest.quest_text}
            </span>

            {quest.current_streak > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Flame size={11} style={{ color: '#ef4444' }} />
                <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                  {quest.current_streak}
                </span>
              </div>
            )}

            <button
              onClick={() => deleteDailyQuest(quest.id)}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-60 transition-opacity"
              style={{ color: '#555570', opacity: 0.25 }}
            >
              <Trash2 size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="px-5 py-3 flex items-center gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={dailyQuests.length === 0 ? 'Add a daily habit…' : `Add habit ${dailyQuests.length + 1} of 3…`}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#e2e8f0' }}
            onFocus={(e) => ((e.target.parentElement!).style.borderColor = '#ef444440')}
            onBlur={(e) => ((e.target.parentElement!).style.borderColor = 'transparent')}
          />
          <button
            type="submit"
            disabled={!newText.trim() || adding}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: newText.trim() ? '#ef444420' : 'transparent',
              color: newText.trim() ? '#ef4444' : '#333350',
            }}
          >
            <Plus size={14} />
          </button>
        </form>
      )}

      {!canAdd && completedCount < 3 && (
        <p className="px-5 py-3 text-xs" style={{ color: '#333350', borderTop: '1px solid #1a1a28' }}>
          Complete all 3 habits for 2× XP bonus
        </p>
      )}
    </div>
  )
}
