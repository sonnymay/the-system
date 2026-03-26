import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function DailyQuests() {
  const quests = useStore((s) => s.quests)
  const addQuest = useStore((s) => s.addQuest)
  const completeQuest = useStore((s) => s.completeQuest)
  const deleteQuest = useStore((s) => s.deleteQuest)

  const [newText, setNewText] = useState('')
  const canAdd = quests.length < 3

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    addQuest(newText.trim())
    setNewText('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">Daily Habits</p>
        <p className="text-xs text-gray-400">{quests.filter(q => q.completed_today).length}/{quests.length}</p>
      </div>

      <div className="divide-y divide-gray-50">
        <AnimatePresence initial={false}>
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-center gap-3 px-5 py-3.5"
            >
              <button
                onClick={() => !quest.completed_today && completeQuest(quest.id)}
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

              <span className="flex-1 text-sm" style={{
                color: quest.completed_today ? '#9ca3af' : '#111827',
                textDecoration: quest.completed_today ? 'line-through' : 'none',
              }}>
                {quest.quest_text}
              </span>

              {quest.current_streak > 1 && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Flame size={11} className="text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">{quest.current_streak}</span>
                </div>
              )}

              <button
                onClick={() => deleteQuest(quest.id)}
                className="flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-400 transition-all text-sm leading-none"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {canAdd && (
          <form onSubmit={handleAdd} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-dashed border-gray-200" />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a habit…"
              className="flex-1 text-sm bg-transparent outline-none text-gray-700"
            />
            {newText.trim() && (
              <button type="submit" className="flex-shrink-0 text-violet-500 hover:text-violet-600">
                <Plus size={15} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
