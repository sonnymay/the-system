import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion'
import { Flame, GripVertical } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { LocalQuest } from '../store/useStore'
import { QUEST_XP, DAILY_CHALLENGE_XP } from '../lib/types'
import { useTheme } from '../lib/theme'

const HABIT_EMOJIS = [
  '🏃','💪','📚','💧','🧘','🥗','😴','✍️',
  '🎯','🏋️','🚶','💊','🍎','🎵','🌅','🧹',
  '💰','🧠','❤️','🌱','⚡','🔥','☕','🎮',
  '🛁','🌞','🥤','🧴','📝','🎨','🏊','🚴',
]

function useTimeUntilMidnight() {
  const [label, setLabel] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diffMs = midnight.getTime() - now.getTime()
      const h = Math.floor(diffMs / 3600000)
      const m = Math.floor((diffMs % 3600000) / 60000)
      setUrgent(h < 2)
      setLabel(h > 0 ? `${h}h ${m}m left` : `${m}m left`)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  return { label, urgent }
}

function useHoldPress(onHold: () => void, delay = 600) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  return {
    onMouseDown: () => { timer.current = setTimeout(onHold, delay) },
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: () => { timer.current = setTimeout(onHold, delay) },
    onTouchEnd: clear,
    onTouchMove: clear,
  }
}

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

function EmojiPicker({ current, onSelect, onClose }: { current: string; onSelect: (e: string) => void; onClose: () => void }) {
  const t = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute left-0 top-full z-50 mt-1 rounded-2xl shadow-xl p-2 grid grid-cols-8 gap-0.5"
      style={{ background: t.card, border: `1px solid ${t.border}`, minWidth: '220px' }}
      onMouseLeave={onClose}
    >
      {HABIT_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => { onSelect(e); onClose() }}
          className="w-7 h-7 text-base flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ background: e === current ? t.border : 'transparent' }}
        >
          {e}
        </button>
      ))}
    </motion.div>
  )
}

function QuestRow({ quest, onComplete, onDelete }: {
  quest: LocalQuest
  onComplete: (x: number, y: number) => void
  onDelete: () => void
}) {
  const dragControls = useDragControls()
  const updateQuestText = useStore((s) => s.updateQuestText)
  const updateQuestEmoji = useStore((s) => s.updateQuestEmoji)
  const t = useTheme()

  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(quest.quest_text)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const holdHandlers = useHoldPress(() => {
    setEditText(quest.quest_text)
    setEditing(true)
  })

  function saveEdit() {
    const trimmed = editText.trim()
    if (trimmed) updateQuestText(quest.id, trimmed)
    else setEditText(quest.quest_text)
    setEditing(false)
  }

  function handleComplete(e: React.MouseEvent) {
    if (quest.completed_today) return
    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 600)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onComplete(rect.x + rect.width / 2, rect.y)
  }

  return (
    <Reorder.Item
      value={quest}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      style={{ background: t.card, listStyle: 'none' }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <SwipeableRow onDelete={onDelete} bg={t.card}>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: t.border }}>
          {/* Drag handle */}
          <div
            onPointerDown={(e) => { e.preventDefault(); dragControls.start(e) }}
            className="flex-shrink-0 cursor-grab select-none"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={13} style={{ color: t.textMuted }} />
          </div>

          {/* Complete button — satisfying spring animation */}
          <motion.button
            onClick={handleComplete}
            animate={justCompleted ? { scale: [1, 1.45, 0.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: quest.completed_today ? '#10b981' : '#d1d5db',
              background: quest.completed_today ? '#10b981' : t.card,
              cursor: quest.completed_today ? 'default' : 'pointer',
            }}
          >
            {quest.completed_today && (
              <motion.svg
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                width="9" height="7" viewBox="0 0 9 7" fill="none"
              >
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </motion.button>

          {/* Emoji button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-base w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
              style={{ background: showEmojiPicker ? t.border : 'transparent' }}
              title="Change emoji"
            >
              {quest.emoji || '✅'}
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker
                  current={quest.emoji || '✅'}
                  onSelect={(e) => updateQuestEmoji(quest.id, e)}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Quest text — long-press to edit */}
          {editing ? (
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              className="flex-1 text-sm bg-transparent outline-none border-b"
              style={{ color: t.text, borderColor: '#10b981' }}
            />
          ) : (
            <span
              className="flex-1 text-sm select-none"
              style={{
                color: quest.completed_today ? t.textMuted : t.text,
                textDecoration: quest.completed_today ? 'line-through' : 'none',
              }}
              {...holdHandlers}
            >
              {quest.quest_text}
            </span>
          )}

          <span className="text-xs font-medium flex-shrink-0" style={{ color: t.textMuted }}>+{QUEST_XP}</span>

          {quest.current_streak > 1 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Flame size={11} className="text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">{quest.current_streak}</span>
            </div>
          )}
        </div>
      </SwipeableRow>
    </Reorder.Item>
  )
}

export default function DailyQuests() {
  const quests = useStore((s) => s.quests)
  const addQuest = useStore((s) => s.addQuest)
  const completeQuest = useStore((s) => s.completeQuest)
  const deleteQuest = useStore((s) => s.deleteQuest)
  const reorderQuests = useStore((s) => s.reorderQuests)
  const dailyChallenge = useStore((s) => s.dailyChallenge)
  const completeDailyChallenge = useStore((s) => s.completeDailyChallenge)
  const isPerfectDay = useStore((s) => s.isPerfectDay)
  const streakFreezes = useStore((s) => s.streakFreezes)
  const t = useTheme()

  const [newText, setNewText] = useState('')
  const canAdd = quests.length < 10
  const doneCount = quests.filter((q) => q.completed_today).length
  const { label: timeLabel, urgent: timeUrgent } = useTimeUntilMidnight()
  const streakAtRisk = timeUrgent && doneCount < quests.length && quests.length > 0

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || !canAdd) return
    addQuest(newText.trim())
    setNewText('')
  }

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden transition-all duration-500"
      style={{
        background: t.card,
        boxShadow: isPerfectDay
          ? '0 0 0 2px #fbbf24, 0 4px 16px rgba(251,191,36,0.15)'
          : streakAtRisk
          ? '0 0 0 2px #ef4444, 0 4px 16px rgba(239,68,68,0.12)'
          : undefined,
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold" style={{ color: t.text }}>Daily Habits</p>
          {streakFreezes > 0 && (
            <div className="flex items-center gap-0.5" title={`${streakFreezes} Streak Freeze${streakFreezes > 1 ? 's' : ''} — protects your streak if you miss a day`}>
              {Array.from({ length: streakFreezes }).map((_, i) => (
                <span key={i} className="text-sm">🛡️</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {streakAtRisk && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >
              ⚠️ Streak at risk!
            </motion.span>
          )}
          {!streakAtRisk && timeLabel && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: timeUrgent ? '#fee2e2' : t.buttonBg,
                color: timeUrgent ? '#dc2626' : t.textMuted,
              }}
            >
              🕛 {timeLabel}
            </span>
          )}
          {quests.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: doneCount === quests.length ? '#d1fae5' : t.buttonBg,
                color: doneCount === quests.length ? '#059669' : t.textMuted,
              }}>
              {doneCount}/{quests.length}
            </span>
          )}
        </div>
      </div>

      <div className="border-t" style={{ borderColor: t.border }}>
        <Reorder.Group
          axis="y"
          values={quests}
          onReorder={reorderQuests}
          as="div"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          <AnimatePresence initial={false}>
            {quests.map((quest) => (
              <QuestRow
                key={quest.id}
                quest={quest}
                onComplete={(x, y) => completeQuest(quest.id, x, y)}
                onDelete={() => deleteQuest(quest.id)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {quests.length === 0 && (
          <div className="px-5 py-4 text-center">
            <p className="text-sm" style={{ color: t.textSub }}>Build your first habit below.</p>
            <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Complete all habits to unlock 2× XP on tasks.</p>
          </div>
        )}

        {canAdd && (
          <form onSubmit={handleAdd} className="flex items-center gap-3 px-4 py-3 border-t mx-3 mb-3 mt-1 rounded-xl"
            style={{ borderColor: t.border, borderWidth: '1.5px', borderStyle: 'dashed', background: t.cardAlt }}>
            <input type="text" value={newText} onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a habit…"
              className="flex-1 text-sm bg-transparent outline-none font-medium"
              style={{ color: t.text }} />
            <button
              type="submit"
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-lg leading-none transition-all"
              style={{ background: newText.trim() ? '#10b981' : t.textMuted }}
            >
              +
            </button>
          </form>
        )}
      </div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <div className="border-t" style={{ borderColor: t.border }}>
          <div className="px-5 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-wider" style={{ color: '#f59e0b' }}>⚡ DAILY CHALLENGE</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: '#fef3c7', color: '#d97706' }}>+{DAILY_CHALLENGE_XP} XP</span>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={(e) => {
                  if (dailyChallenge.completed) return
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  completeDailyChallenge(rect.x + rect.width / 2, rect.y)
                }}
                whileTap={!dailyChallenge.completed ? { scale: 1.3 } : {}}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: dailyChallenge.completed ? '#f59e0b' : '#d1d5db',
                  background: dailyChallenge.completed ? '#f59e0b' : t.card,
                  cursor: dailyChallenge.completed ? 'default' : 'pointer',
                }}
              >
                {dailyChallenge.completed && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </motion.button>
              <span
                className="flex-1 text-sm"
                style={{
                  color: dailyChallenge.completed ? t.textMuted : t.text,
                  textDecoration: dailyChallenge.completed ? 'line-through' : 'none',
                }}
              >
                {dailyChallenge.text}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
