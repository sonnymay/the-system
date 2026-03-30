import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function FreezeToast() {
  const freezeUsedEvent = useStore((s) => s.freezeUsedEvent)
  const freezeEarnedEvent = useStore((s) => s.freezeEarnedEvent)
  const streakFreezes = useStore((s) => s.streakFreezes)
  const clearFreezeUsedEvent = useStore((s) => s.clearFreezeUsedEvent)
  const clearFreezeEarnedEvent = useStore((s) => s.clearFreezeEarnedEvent)

  useEffect(() => {
    if (!freezeUsedEvent) return
    const id = setTimeout(clearFreezeUsedEvent, 3500)
    return () => clearTimeout(id)
  }, [freezeUsedEvent, clearFreezeUsedEvent])

  useEffect(() => {
    if (!freezeEarnedEvent) return
    const id = setTimeout(clearFreezeEarnedEvent, 4000)
    return () => clearTimeout(id)
  }, [freezeEarnedEvent, clearFreezeEarnedEvent])

  const active = freezeUsedEvent || freezeEarnedEvent

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={freezeUsedEvent ? 'used' : 'earned'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl"
          style={{
            background: freezeEarnedEvent ? '#2563eb' : '#0891b2',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="text-lg">🛡️</span>
          <span className="text-sm font-semibold text-white">
            {freezeEarnedEvent
              ? `Streak Freeze earned! (${streakFreezes}/3)`
              : 'Streak protected by Freeze!'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
