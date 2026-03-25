import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, XP_VALUES } from '../lib/types'

const MONSTER_ICONS: Record<TaskDifficulty, string> = {
  poring: '🍄',
  orc: '👺',
  drake: '🐉',
  mvp: '💀',
}

const DIFFICULTIES: TaskDifficulty[] = ['poring', 'orc', 'drake', 'mvp']

export default function TaskList() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const completeTask = useStore((s) => s.completeTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('orc')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    await addTask(title.trim(), difficulty)
    setTitle('')
    setAdding(false)
    inputRef.current?.focus()
  }

  function handleComplete(taskId: string, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    completeTask(taskId, rect.x + rect.width / 2, rect.y + rect.height / 2)
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#111118', border: '1px solid #1e1e2e' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <h3 className="text-sm font-semibold text-white">Quests</h3>
      </div>

      {/* Difficulty picker */}
      <div className="px-5 pt-4 pb-3 flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: difficulty === d ? `${DIFFICULTY_COLORS[d]}20` : 'transparent',
              color: difficulty === d ? DIFFICULTY_COLORS[d] : '#444460',
              border: `1px solid ${difficulty === d ? DIFFICULTY_COLORS[d] + '50' : '#1e1e2e'}`,
            }}
          >
            <span className="block text-base leading-none mb-1">{MONSTER_ICONS[d]}</span>
            <span>+{XP_VALUES[d]}</span>
          </button>
        ))}
      </div>

      {/* Add task input */}
      <form onSubmit={handleAdd} className="px-5 pb-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`New ${DIFFICULTY_LABELS[difficulty].toLowerCase()} quest…`}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#1a1a28', border: '1px solid #252535', color: '#e2e8f0' }}
          onFocus={(e) => (e.target.style.borderColor = DIFFICULTY_COLORS[difficulty] + '80')}
          onBlur={(e) => (e.target.style.borderColor = '#252535')}
        />
        <button
          type="submit"
          disabled={!title.trim() || adding}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: title.trim() ? DIFFICULTY_COLORS[difficulty] + '25' : '#1a1a28',
            border: `1px solid ${title.trim() ? DIFFICULTY_COLORS[difficulty] + '60' : '#252535'}`,
            color: title.trim() ? DIFFICULTY_COLORS[difficulty] : '#333350',
          }}
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Task list */}
      <div>
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 pb-6 text-sm text-center"
              style={{ color: '#333350' }}
            >
              No active quests
            </motion.p>
          ) : (
            tasks.map((task) => {
              const diff = task.difficulty as TaskDifficulty
              const xp = isPerfectDay ? task.xp_value * 2 : task.xp_value
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderTop: '1px solid #1a1a28' }}
                >
                  <span className="text-base flex-shrink-0">{MONSTER_ICONS[diff]}</span>

                  <span className="flex-1 text-sm text-white truncate">{task.title}</span>

                  <span className="text-xs font-medium flex-shrink-0"
                    style={{ color: DIFFICULTY_COLORS[diff] }}>
                    +{xp}
                  </span>

                  <button
                    onClick={(e) => handleComplete(task.id, e)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#10b98118', border: '1px solid #10b98140', color: '#10b981' }}
                  >
                    <Check size={13} />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-30 hover:opacity-70 transition-opacity"
                    style={{ color: '#888' }}
                  >
                    <Trash2 size={12} />
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
