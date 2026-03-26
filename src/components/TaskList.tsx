import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS, XP_VALUES } from '../lib/types'

const DIFFICULTIES: TaskDifficulty[] = ['poring', 'orc', 'drake', 'mvp']

const DIFF_ICONS: Record<TaskDifficulty, string> = {
  poring: '🍄',
  orc: '👺',
  drake: '🐉',
  mvp: '💀',
}

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
    <div className="px-6 pb-8">
      {/* Section label */}
      <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: '#303040' }}>
        QUESTS
      </p>

      {/* Add input */}
      <form onSubmit={handleAdd} className="flex items-center gap-3 mb-1">
        {/* Difficulty tap-to-cycle */}
        <button
          type="button"
          onClick={cycleDifficulty}
          className="flex-shrink-0 text-base leading-none select-none"
          title={`${difficulty} · tap to change`}
        >
          {DIFF_ICONS[difficulty]}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New quest…"
          className="flex-1 text-sm bg-transparent outline-none py-2"
          style={{ color: '#f0f0f5', borderBottom: '1px solid #13131e' }}
          onFocus={(e) => (e.target.style.borderBottomColor = DIFFICULTY_COLORS[difficulty] + '60')}
          onBlur={(e) => (e.target.style.borderBottomColor = '#13131e')}
        />

        <span className="text-xs flex-shrink-0 tabular-nums"
          style={{ color: DIFFICULTY_COLORS[difficulty], opacity: 0.7 }}>
          +{isPerfectDay ? XP_VALUES[difficulty] * 2 : XP_VALUES[difficulty]}
        </span>
      </form>

      {/* Task rows */}
      <div className="mt-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {tasks.map((task) => {
            const diff = task.difficulty as TaskDifficulty
            const xp = isPerfectDay ? task.xp_value * 2 : task.xp_value
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-3 py-2"
              >
                <span className="flex-shrink-0 text-base leading-none">{DIFF_ICONS[diff]}</span>

                <span className="flex-1 text-sm" style={{ color: '#c8c8d8' }}>
                  {task.title}
                </span>

                <span className="text-xs tabular-nums flex-shrink-0"
                  style={{ color: DIFFICULTY_COLORS[diff], opacity: 0.6 }}>
                  +{xp}
                </span>

                {/* Complete */}
                <button
                  onClick={(e) => handleComplete(task.id, e)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-md"
                  style={{ color: '#10b981', background: '#10b98115' }}
                >
                  done
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity text-xs"
                  style={{ color: '#505060' }}
                >
                  ✕
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {tasks.length === 0 && (
          <p className="text-sm py-2" style={{ color: '#252530' }}>
            No active quests
          </p>
        )}
      </div>
    </div>
  )
}
