import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { LocalTask } from '../store/useStore'
import type { TaskDifficulty } from '../lib/types'
import { DIFFICULTY_COLORS } from '../lib/types'
import { useTheme } from '../lib/theme'

const DIFFICULTIES: TaskDifficulty[] = ['poring', 'orc', 'drake', 'mvp']
const ICONS: Record<TaskDifficulty, string> = { poring: '🍄', orc: '👺', drake: '🐉', mvp: '💀' }
const LABELS: Record<TaskDifficulty, string> = { poring: 'Easy', orc: 'Medium', drake: 'Hard', mvp: 'Epic' }

function dueDateLabel(due: string): { label: string; overdue: boolean; today: boolean } {
  const todayStr = new Date().toISOString().split('T')[0]
  if (due < todayStr) return { label: 'overdue', overdue: true, today: false }
  if (due === todayStr) return { label: 'today', overdue: false, today: true }
  const d = new Date(due + 'T00:00:00')
  return { label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), overdue: false, today: false }
}

function SwipeableRow({ onDelete, bg, children }: { onDelete: () => void; bg: string; children: React.ReactNode }) {
  const [swiped, setSwiped] = useState(false)
  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <span className="text-white text-xs font-semibold">Delete</span>
      </div>
      <motion.div drag="x" dragConstraints={{ left: -80, right: 0 }} dragElastic={0.05}
        onDragEnd={(_, info) => { if (info.offset.x < -55) { setSwiped(true); setTimeout(onDelete, 180) } }}
        animate={{ x: swiped ? -80 : 0 }} style={{ background: bg }} className="relative">
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

  const due = task.due_date ? dueDateLabel(task.due_date) : null

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
      <div className="group flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: t.border }}>
        <button onClick={onComplete}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center hover:border-emerald-400 transition-all"
          style={{ borderColor: '#d1d5db' }} />
        <span className="flex-shrink-0 text-sm">{ICONS[diff]}</span>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditValue(task.title); setEditing(false) } }}
              className="w-full text-sm bg-transparent outline-none border-b"
              style={{ color: t.text, borderColor: DIFFICULTY_COLORS[diff] }} />
          ) : (
            <span className="text-sm truncate block select-none cursor-pointer" style={{ color: t.text }}
              title="Hold to rename"
              onMouseDown={startHold} onMouseUp={clearHold} onMouseLeave={clearHold}
              onTouchStart={startHold} onTouchEnd={clearHold} onTouchMove={clearHold}>
              {task.title}
            </span>
          )}
          {due && (
            <span className="text-xs font-medium"
              style={{ color: due.overdue ? '#dc2626' : due.today ? '#d97706' : t.textMuted }}>
              📅 {due.label}
            </span>
          )}
        </div>

        <span className="text-xs font-medium flex-shrink-0" style={{ color: DIFFICULTY_COLORS[diff] }}>+{xp}</span>
        <button onClick={onDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-base leading-none"
          style={{ color: t.textMuted }}>×</button>
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
  const [dueDate, setDueDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  function cycleDifficulty() {
    setDifficulty(DIFFICULTIES[(DIFFICULTIES.indexOf(difficulty) + 1) % DIFFICULTIES.length])
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), difficulty, dueDate || undefined)
    setTitle(''); setDueDate(''); setShowDatePicker(false)
    inputRef.current?.focus()
  }

  // Sort: overdue first, then by due date, then no-date
  const sorted = [...tasks].sort((a, b) => {
    const aDate = a.due_date ?? 'zzz'
    const bDate = b.due_date ?? 'zzz'
    return aDate.localeCompare(bDate)
  })

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

      <form onSubmit={handleAdd} className="flex flex-col gap-2 px-4 py-3 border-t mx-3 mb-3 mt-1 rounded-xl"
        style={{ borderColor: t.border, borderWidth: '1.5px', borderStyle: 'dashed', background: t.cardAlt }}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={cycleDifficulty}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg"
            style={{ background: DIFFICULTY_COLORS[difficulty] + '18', color: DIFFICULTY_COLORS[difficulty] }}>
            <span>{ICONS[difficulty]}</span><span>{LABELS[difficulty]}</span>
          </button>
          <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…" className="flex-1 text-sm bg-transparent outline-none font-medium"
            style={{ color: t.text }} />
          <button type="button" onClick={() => setShowDatePicker((v) => !v)} title="Set due date"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: dueDate ? '#f59e0b' : t.textMuted, background: showDatePicker ? t.border : 'transparent' }}>
            <CalendarDays size={14} />
          </button>
          <button type="submit"
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-lg leading-none"
            style={{ background: title.trim() ? DIFFICULTY_COLORS[difficulty] : t.textMuted }}>+</button>
        </div>
        {showDatePicker && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: t.textMuted }}>Due date</span>
            <input type="date" value={dueDate} min={todayStr}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none rounded-lg px-2 py-1 border"
              style={{ borderColor: t.border, color: t.text }} />
            {dueDate && (
              <button type="button" onClick={() => setDueDate('')}
                className="text-xs" style={{ color: t.textMuted }}>Clear</button>
            )}
          </div>
        )}
      </form>

      <div className="border-t" style={{ borderColor: t.border }}>
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-5 text-center">
              <p className="text-sm" style={{ color: t.textSub }}>No tasks yet.</p>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Add one above and earn XP when you finish.</p>
            </motion.div>
          ) : (
            sorted.map((task) => (
              <motion.div key={task.id} layout
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <TaskRow task={task} xp={isPerfectDay ? task.xp_value * 2 : task.xp_value}
                  onComplete={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    completeTask(task.id, rect.x + rect.width / 2, rect.y + rect.height / 2)
                  }}
                  onDelete={() => deleteTask(task.id)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
