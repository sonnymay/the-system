import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function WeeklySummaryModal() {
  const weekSummaryEvent = useStore((s) => s.weekSummaryEvent)
  const lastWeekStats = useStore((s) => s.lastWeekStats)
  const clearWeekSummaryEvent = useStore((s) => s.clearWeekSummaryEvent)

  useEffect(() => {
    if (weekSummaryEvent) {
      const t = setTimeout(clearWeekSummaryEvent, 10000)
      return () => clearTimeout(t)
    }
  }, [weekSummaryEvent, clearWeekSummaryEvent])

  return (
    <AnimatePresence>
      {weekSummaryEvent && lastWeekStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={clearWeekSummaryEvent}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Last Week</p>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Report</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'XP Earned', value: lastWeekStats.xpEarned.toLocaleString() },
                { label: 'Habits', value: lastWeekStats.habitsCompleted },
                { label: 'Tasks', value: lastWeekStats.tasksCompleted },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-3">
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={clearWeekSummaryEvent}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: '#6366f1' }}
            >
              Let's go this week
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
