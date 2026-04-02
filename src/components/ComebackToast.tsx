import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const MESSAGES = [
  "You're back. Time to rebuild. 💪",
  "Every champion falls. Champions get back up.",
  "Fresh start. New streak. Let's go. 🔥",
  "Streak lost — but not your will. Start again.",
  "Comebacks hit harder than never-fell. Let's run it.",
]

export default function ComebackToast() {
  const comebackEvent = useStore((s) => s.comebackEvent)
  const clearComebackEvent = useStore((s) => s.clearComebackEvent)
  const loginStreak = useStore((s) => s.loginStreak)

  useEffect(() => {
    if (!comebackEvent) return
    const id = setTimeout(clearComebackEvent, 5000)
    return () => clearTimeout(id)
  }, [comebackEvent, clearComebackEvent])

  const msg = MESSAGES[loginStreak % MESSAGES.length]

  return (
    <AnimatePresence>
      {comebackEvent && (
        <motion.div
          key="comeback"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 max-w-sm mx-auto z-50 px-4 py-3 rounded-2xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)', border: '1px solid #3b82f630' }}
        >
          <p className="text-sm font-semibold text-white">{msg}</p>
          <p className="text-xs mt-0.5" style={{ color: '#93c5fd' }}>Streak reset — rebuild from today</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
