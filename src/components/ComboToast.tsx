import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function ComboToast() {
  const comboEvent = useStore((s) => s.comboEvent)
  const clearComboEvent = useStore((s) => s.clearComboEvent)

  useEffect(() => {
    if (!comboEvent) return
    const id = setTimeout(clearComboEvent, 2200)
    return () => clearTimeout(id)
  }, [comboEvent, clearComboEvent])

  return (
    <AnimatePresence>
      {comboEvent && (
        <motion.div
          key={`combo-${comboEvent.count}`}
          initial={{ opacity: 0, y: -32, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="fixed top-6 left-1/2 z-50 flex flex-col items-center pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            className="px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5"
            style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', color: 'white' }}
          >
            <span className="text-xl font-black tracking-tight">
              COMBO ×{comboEvent.count}
            </span>
            <span className="text-sm font-bold opacity-90">+{comboEvent.bonusXp} XP</span>
          </div>
          <div className="flex gap-1 mt-1.5">
            {Array.from({ length: comboEvent.count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 600 }}
                className="w-2 h-2 rounded-full bg-orange-400"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
