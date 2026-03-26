import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function DailyQuests() {
  const dailyQuests = useStore((s) => s.quests)
  const addDailyQuest = useStore((s) => s.addQuest)
  const completeDailyQuest = useStore((s) => s.completeQuest)
  const deleteDailyQuest = useStore((s) => s.deleteQuest)

  const [newText, setNewText] = useState('')
  const canAdd = dailyQuests.length < 3

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    addDailyQuest(newText.trim())
    setNewText('')
  }

  return (
    <div className="px-6 pb-2">
      {/* Section label */}
      <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: '#303040' }}>
        DAILY HABITS
      </p>

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {dailyQuests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-center gap-3 py-2"
            >
              {/* Circle checkbox */}
              <button
                onClick={() => !quest.completed_today && completeDailyQuest(quest.id)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                style={{
                  borderColor: quest.completed_today ? '#10b981' : '#252530',
                  background: quest.completed_today ? '#10b981' : 'transparent',
                  cursor: quest.completed_today ? 'default' : 'pointer',
                }}
              >
                {quest.completed_today && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              <span
                className="flex-1 text-sm leading-relaxed"
                style={{
                  color: quest.completed_today ? '#303040' : '#c8c8d8',
                  textDecoration: quest.completed_today ? 'line-through' : 'none',
                }}
              >
                {quest.quest_text}
              </span>

              {quest.current_streak > 1 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Flame size={11} style={{ color: '#ef4444' }} />
                  <span className="text-xs font-semibold tabular-nums" style={{ color: '#ef4444' }}>
                    {quest.current_streak}
                  </span>
                </div>
              )}

              <button
                onClick={() => deleteDailyQuest(quest.id)}
                className="flex-shrink-0 text-xs opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity"
                style={{ color: '#505060' }}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add input — only show if < 3 */}
        {canAdd && (
          <form onSubmit={handleAdd} className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-dashed"
              style={{ borderColor: '#252530' }} />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a daily habit…"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#f0f0f5' }}
            />
          </form>
        )}
      </div>
    </div>
  )
}
