import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, ChevronDown, Swords } from 'lucide-react'
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
  const [showDiffMenu, setShowDiffMenu] = useState(false)
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
    <div className="rounded-2xl overflow-hidden" style={{ background: '#12121a', border: '1px solid #2a2a3f' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #2a2a3f' }}>
        <Swords size={16} style={{ color: '#7c3aed' }} />
        <h3 className="font-semibold text-sm text-white">Active Quests</h3>
        {tasks.length > 0 && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ background: '#7c3aed22', color: '#7c3aed' }}>
            {tasks.length}
          </span>
        )}
      </div>

      {/* Add task form */}
      <form onSubmit={handleAdd} className="px-5 py-4" style={{ borderBottom: '1px solid #1a1a27' }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New quest..."
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#1a1a27', border: '1px solid #2a2a3f', color: '#e2e8f0' }}
            onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
            onBlur={(e) => (e.target.style.borderColor = '#2a2a3f')}
          />

          {/* Difficulty selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDiffMenu(!showDiffMenu)}
              className="h-full px-3 rounded-xl text-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{
                background: `${DIFFICULTY_COLORS[difficulty]}22`,
                border: `1px solid ${DIFFICULTY_COLORS[difficulty]}44`,
                color: DIFFICULTY_COLORS[difficulty],
              }}
            >
              <span>{MONSTER_ICONS[difficulty]}</span>
              <span className="hidden sm:inline">{DIFFICULTY_LABELS[difficulty]}</span>
              <ChevronDown size={12} />
            </button>

            <AnimatePresence>
              {showDiffMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-10 min-w-36"
                  style={{ background: '#1a1a27', border: '1px solid #2a2a3f', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                >
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDifficulty(d); setShowDiffMenu(false) }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors hover:opacity-80"
                      style={{
                        background: difficulty === d ? `${DIFFICULTY_COLORS[d]}22` : 'transparent',
                        color: DIFFICULTY_COLORS[d],
                      }}
                    >
                      <span>{MONSTER_ICONS[d]}</span>
                      <span className="font-medium">{DIFFICULTY_LABELS[d]}</span>
                      <span className="ml-auto text-xs opacity-60">+{XP_VALUES[d]} XP</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || adding}
            className="px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: title.trim() ? '#7c3aed' : '#2a2a3f',
              color: 'white',
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex gap-1 mt-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className="text-xs px-2 py-0.5 rounded-full transition-all"
              style={{
                background: difficulty === d ? `${DIFFICULTY_COLORS[d]}22` : '#1a1a27',
                color: difficulty === d ? DIFFICULTY_COLORS[d] : '#4b5563',
                border: `1px solid ${difficulty === d ? DIFFICULTY_COLORS[d] + '44' : '#2a2a3f'}`,
              }}
            >
              {MONSTER_ICONS[d]} {DIFFICULTY_LABELS[d]} +{XP_VALUES[d]}
            </button>
          ))}
        </div>
      </form>

      {/* Task list */}
      <div className="divide-y" style={{ borderColor: '#1a1a27' }}>
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-8 text-center"
            >
              <p className="text-sm" style={{ color: '#4b5563' }}>No active quests. Add one above.</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-5 py-3.5 flex items-center gap-3"
              >
                {/* Monster icon */}
                <span className="text-lg flex-shrink-0">{MONSTER_ICONS[task.difficulty as TaskDifficulty]}</span>

                {/* Task title */}
                <span className="flex-1 text-sm text-white min-w-0 truncate">{task.title}</span>

                {/* XP badge */}
                <span className="text-xs flex-shrink-0 font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: `${DIFFICULTY_COLORS[task.difficulty as TaskDifficulty]}22`,
                    color: DIFFICULTY_COLORS[task.difficulty as TaskDifficulty],
                  }}>
                  {isPerfectDay ? `${task.xp_value * 2}` : task.xp_value} XP
                  {isPerfectDay && <span className="ml-0.5 opacity-70">×2</span>}
                </span>

                {/* Complete button */}
                <button
                  onClick={(e) => handleComplete(task.id, e)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981' }}
                  title="Complete quest"
                >
                  <Check size={14} />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444' }}
                  title="Delete quest"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
