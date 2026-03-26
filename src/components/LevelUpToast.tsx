import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function LevelUpToast() {
  const levelUpEvent = useStore((s) => s.levelUpEvent)
  const clearLevelUpEvent = useStore((s) => s.clearLevelUpEvent)

  useEffect(() => {
    if (levelUpEvent) {
      const t = setTimeout(clearLevelUpEvent, 2800)
      return () => clearTimeout(t)
    }
  }, [levelUpEvent, clearLevelUpEvent])

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
      <AnimatePresence>
        {levelUpEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-semibold"
            style={{ background: '#1a1a2e' }}
          >
            <span>⬆️</span>
            <span>Level {levelUpEvent}!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
