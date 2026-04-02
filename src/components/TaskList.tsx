import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { LocalTask } from '../store/useStore'
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
        drag="x" dragConstraints={{ left: -80, right: 0 }} dragElastic={0.05}
        onDragEnd={(_, info) => { if (info.offset.x < -55) { setSwiped(true); setTimeout(onDelete, 180) } }}
        animate={{ x: swiped ? -80 : 0 }}
        style={{ background: bg }} className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}

function TaskRow({ task, xp, onComplete, onDelete }: {
  task: LocalTask; xp: number
  onComplete: (e: React.MouseEvent) => void
  onDelete: () => void
}) {
  const updateTaskTitle = useStore((s) => s.updateTaskTitle)
  const t = useTheme()
  const diff = task.difficulty as TaskDifficulty
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)

  function clearHold() { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null } }
  function startHold() { holdTimer.current = setTimeout(() => { setEditValue(task.title); setEditing(true) }, 600) }

  function saveEdit() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) updateTaskTitle(task.id, trimmed)
    else setEditValue(task.title)
    setEditing(false)
  }

  return (
    <SwipeableRow onDelete={onDelete} bg={t.card}>
      <div className="group flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: t.border }}>
        <button
          onClick={onComplete}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center hover:border-emerald-400 transition-all"
          style={{ borderColor: '#d1d5db' }}
        />
        <span className="flex-shrink-0 text-sm">{ICONS[diff]}</span>

        {editing ? (
          <input
            autoFocus value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditValue(task.title); setEditing(false) } }}
            className="flex-1 text-sm bg-transparent outline-none border-b"
            style={{ color: t.text, borderColor: DIFFICULTY_COLORS[diff] }}
          />
        ) : (
          <span
            className="flex-1 text-sm truncate select-none cursor-pointer"
            style={{ color: t.text }}
            title="Hold to rename"
            onMouseDown={startHold} onMouseUp={clearHold} onMouseLeave={clearHold}
            onTouchStart={startHold} onTouchEnd={clearHold} onTouchMove={clearHold}
          >
            {task.title}
          </span>
        )}

        <span className="text-xs font-medium flex-shrink-0" style={{ color: DIFFICULTY_COLORS[diff] }}>
          +{xp}
        </span>
        <button onClick={onDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-base leading-none"
          style={{ color: t.textMuted }}>
          ×
        </button>
      </div>
    </SwipeableRow>
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

      <form onSubmit={handleAdd} className="flex items-center gap-3 px-4 py-3 border-t mx-3 mb-3 mt-1 rounded-xl"
        style={{ borderColor: t.border, borderWidth: '1.5px', borderStyle: 'dashed', background: t.cardAlt }}>
        <button type="button" onClick={cycleDifficulty}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ background: DIFFICULTY_COLORS[difficulty] + '18', color: DIFFICULTY_COLORS[difficulty] }}>
          <span>{ICONS[difficulty]}</span>
          <span>{LABELS[difficulty]}</span>
        </button>
        <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…" className="flex-1 text-sm bg-transparent outline-none font-medium"
          style={{ color: t.text }} />
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: DIFFICULTY_COLORS[difficulty] }}>
          +{isPerfectDay ? XP_VALUES[difficulty] * 2 : XP_VALUES[difficulty]}
        </span>
        <button type="submit"
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-lg leading-none"
          style={{ background: title.trim() ? DIFFICULTY_COLORS[difficulty] : t.textMuted }}>
          +
        </button>
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
              const xp = isPerfectDay ? task.xp_value * 2 : task.xp_value
              return (
                <motion.div key={task.id} layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}>
                  <TaskRow
                    task={task} xp={xp}
                    onComplete={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      completeTask(task.id, rect.x + rect.width / 2, rect.y + rect.height / 2)
                    }}
                    onDelete={() => deleteTask(task.id)}
                  />
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
