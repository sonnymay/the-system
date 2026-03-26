import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useStore } from '../store/useStore'
import { QUEST_XP } from '../lib/types'

export default function DailyQuests() {
  const quests = useStore((s) => s.quests)
  const addQuest = useStore((s) => s.addQuest)
  const completeQuest = useStore((s) => s.completeQuest)
  const deleteQuest = useStore((s) => s.deleteQuest)

  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const [newText, setNewText] = useState('')
  const canAdd = quests.length < 3
  const doneCount = quests.filter((q) => q.completed_today).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    addQuest(newText.trim())
    setNewText('')
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500"
      style={isPerfectDay ? { boxShadow: '0 0 0 2px #fbbf24, 0 4px 16px rgba(251,191,36,0.15)' } : {}}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="font-semibold text-gray-900">Daily Habits</p>
        {quests.length > 0 && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: doneCount === quests.length ? '#d1fae5' : '#f3f4f6',
              color: doneCount === quests.length ? '#059669' : '#9ca3af',
            }}
          >
            {doneCount}/{quests.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="border-t border-gray-50">
        <AnimatePresence initial={false}>
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="group"
            >
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                <button
                  onClick={(e) => {
                    if (quest.completed_today) return
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    completeQuest(quest.id, rect.x + rect.width / 2, rect.y)
                  }}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: quest.completed_today ? '#10b981' : '#d1d5db',
                    background: quest.completed_today ? '#10b981' : 'white',
                    cursor: quest.completed_today ? 'default' : 'pointer',
                  }}
                >
                  {quest.completed_today && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <span
                  className="flex-1 text-sm"
                  style={{
                    color: quest.completed_today ? '#9ca3af' : '#111827',
                    textDecoration: quest.completed_today ? 'line-through' : 'none',
                  }}
                >
                  {quest.quest_text}
                </span>

                <span className="text-xs font-medium flex-shrink-0 text-gray-300">
                  +{QUEST_XP}
                </span>

                {quest.current_streak > 1 && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Flame size={11} className="text-orange-400" />
                    <span className="text-xs font-semibold text-orange-400">{quest.current_streak}</span>
                  </div>
                )}

                <button
                  onClick={() => deleteQuest(quest.id)}
                  className="flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-base leading-none ml-1"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {quests.length === 0 && (
          <div className="px-5 py-4 text-center">
            <p className="text-sm text-gray-400">Build your first habit below.</p>
            <p className="text-xs text-gray-300 mt-0.5">Complete all 3 daily for 2× XP on tasks.</p>
          </div>
        )}

        {/* Add row */}
        {canAdd && (
          <form onSubmit={handleAdd} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-dashed border-gray-200" />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={quests.length === 0 ? 'Add your first habit…' : 'Add a habit…'}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#374151' }}
            />
            {newText.trim() && (
              <button
                type="submit"
                className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#f3f4f6', color: '#6b7280' }}
              >
                Add
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
