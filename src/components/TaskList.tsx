import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS, XP_VALUES } from '../lib/types'

const DIFFICULTIES: TaskDifficulty[] = ['poring', 'orc', 'drake', 'mvp']
const ICONS: Record<TaskDifficulty, string> = { poring: '🍄', orc: '👺', drake: '🐉', mvp: '💀' }
const LABELS: Record<TaskDifficulty, string> = { poring: 'Easy', orc: 'Medium', drake: 'Hard', mvp: 'Epic' }

export default function TaskList() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const completeTask = useStore((s) => s.completeTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('orc')
  const inputRef = useRef<HTMLInputElement>(null)

  function cycleDifficulty() {
    const idx = DIFFICULTIES.indexOf(difficulty)
    setDifficulty(DIFFICULTIES[(idx + 1) % DIFFICULTIES.length])
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), difficulty)
    setTitle('')
    inputRef.current?.focus()
  }

  function handleComplete(taskId: string, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    completeTask(taskId, rect.x + rect.width / 2, rect.y + rect.height / 2)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">Quests</p>
        {tasks.length > 0 && (
          <span className="text-xs text-gray-400">{tasks.length} active</span>
        )}
      </div>

      {/* Add task row */}
      <form onSubmit={handleAdd} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
        {/* Difficulty tap-to-cycle */}
        <button
          type="button"
          onClick={cycleDifficulty}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
          style={{ background: DIFFICULTY_COLORS[difficulty] + '15', color: DIFFICULTY_COLORS[difficulty] }}
          title="Tap to change difficulty"
        >
          <span>{ICONS[difficulty]}</span>
          <span>{LABELS[difficulty]}</span>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a quest…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700"
        />

        <span className="text-xs font-medium flex-shrink-0"
          style={{ color: DIFFICULTY_COLORS[difficulty] }}>
          +{isPerfectDay ? XP_VALUES[difficulty] * 2 : XP_VALUES[difficulty]} XP
        </span>
      </form>

      {/* Task rows */}
      <div className="divide-y divide-gray-50">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-300">No active quests</p>
          ) : (
            tasks.map((task) => {
              const diff = task.difficulty as TaskDifficulty
              const xp = isPerfectDay ? task.xp_value * 2 : task.xp_value
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex-shrink-0 text-base">{ICONS[diff]}</span>

                  <span className="flex-1 text-sm text-gray-700 truncate">{task.title}</span>

                  <span className="text-xs font-medium flex-shrink-0"
                    style={{ color: DIFFICULTY_COLORS[diff] }}>
                    +{xp}
                  </span>

                  <button
                    onClick={(e) => handleComplete(task.id, e)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-all"
                  >
                    done
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-70 text-gray-400 transition-all text-sm leading-none"
                  >
                    ×
                  </button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
