import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const MILESTONE_LABELS: Record<number, string> = {
  7:   '7-day streak! 🔥',
  14:  '14-day streak! 🔥🔥',
  30:  '30-day streak! Unstoppable! 🔥',
  60:  '60-day streak! Legendary! ⚡',
  100: '100-day streak! Shadow Monarch! 💀',
}

export default function StreakMilestoneToast() {
  const streakMilestoneEvent = useStore((s) => s.streakMilestoneEvent)
  const clearStreakMilestoneEvent = useStore((s) => s.clearStreakMilestoneEvent)

  useEffect(() => {
    if (streakMilestoneEvent) {
      const t = setTimeout(clearStreakMilestoneEvent, 3500)
      return () => clearTimeout(t)
    }
  }, [streakMilestoneEvent, clearStreakMilestoneEvent])

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
      <AnimatePresence>
        {streakMilestoneEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
            style={{ background: '#f97316', color: 'white' }}
          >
            {MILESTONE_LABELS[streakMilestoneEvent] ?? `${streakMilestoneEvent}-day streak! 🔥`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
