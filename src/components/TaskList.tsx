import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS, XP_VALUES } from '../lib/types'
import { useTheme } from '../lib/theme'

const DIFFICULTIES: TaskDifficulty[] = ['poring', 'orc', 'drake', 'mvp']
const ICONS: Record<TaskDifficulty, string> = { poring: '🍄', orc: '👺', drake: '🐉', mvp: '💀' }
const LABELS: Record<TaskDifficulty, string> = { poring: 'Easy', orc: 'Medium', drake: 'Hard', mvp: 'Epic' }

function SwipeableRow({ onDelete, bg, children }: { onDelete: () => void; bg: string; children: React.ReactNode }) {
  const [swiped, setSwiped] = useState(false)
  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <span className="text-white text-xs font-semibold">Delete</span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -55) { setSwiped(true); setTimeout(onDelete, 180) }
        }}
        animate={{ x: swiped ? -80 : 0 }}
        style={{ background: bg }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function TaskList() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const completeTask = useStore((s) => s.completeTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const isPerfectDay = useStore((s) => s.isPerfectDay)
  const t = useTheme()

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
    <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: t.card }}>
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="font-semibold" style={{ color: t.text }}>Tasks</p>
        {tasks.length > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: t.buttonBg, color: t.textMuted }}>
            {tasks.length} active
          </span>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-3 px-5 py-3.5 border-t" style={{ borderColor: t.border }}>
        <button type="button" onClick={cycleDifficulty}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
          style={{ background: DIFFICULTY_COLORS[difficulty] + '15', color: DIFFICULTY_COLORS[difficulty] }}>
          <span>{ICONS[difficulty]}</span>
          <span>{LABELS[difficulty]}</span>
        </button>
        <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…" className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: t.text }} />
        <span className="text-xs font-medium flex-shrink-0" style={{ color: DIFFICULTY_COLORS[difficulty] }}>
          +{isPerfectDay ? XP_VALUES[difficulty] * 2 : XP_VALUES[difficulty]} XP
        </span>
      </form>

      <div className="border-t" style={{ borderColor: t.border }}>
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-5 text-center">
              <p className="text-sm" style={{ color: t.textSub }}>No tasks yet.</p>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Add one above and earn XP when you finish.</p>
            </motion.div>
          ) : (
            tasks.map((task) => {
              const diff = task.difficulty as TaskDifficulty
              const xp = isPerfectDay ? task.xp_value * 2 : task.xp_value
              return (
                <motion.div key={task.id} layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}>
                  <SwipeableRow onDelete={() => deleteTask(task.id)} bg={t.card}>
                    <div className="group flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: t.border }}>
                      <button onClick={(e) => handleComplete(task.id, e)}
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                        style={{ borderColor: '#d1d5db' }}
                        title="Mark done" />
                      <span className="flex-shrink-0 text-sm">{ICONS[diff]}</span>
                      <span className="flex-1 text-sm truncate" style={{ color: t.text }}>{task.title}</span>
                      <span className="text-xs font-medium flex-shrink-0" style={{ color: DIFFICULTY_COLORS[diff] }}>
                        +{xp}
                      </span>
                      <button onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-base leading-none"
                        style={{ color: t.textMuted }}>
                        ×
                      </button>
                    </div>
                  </SwipeableRow>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
