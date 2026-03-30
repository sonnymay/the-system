import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function LuckyStrikeToast() {
  const luckyStrikeEvent = useStore((s) => s.luckyStrikeEvent)
  const clearLuckyStrikeEvent = useStore((s) => s.clearLuckyStrikeEvent)

  useEffect(() => {
    if (!luckyStrikeEvent) return
    const id = setTimeout(clearLuckyStrikeEvent, 2500)
    return () => clearTimeout(id)
  }, [luckyStrikeEvent, clearLuckyStrikeEvent])

  return (
    <AnimatePresence>
      {luckyStrikeEvent && (
        <motion.div
          key={luckyStrikeEvent}
          initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -12 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="fixed top-20 left-1/2 z-50 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            className="px-5 py-2.5 rounded-2xl shadow-2xl text-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white' }}
          >
            <div className="text-base font-black tracking-tight">⚡ LUCKY STRIKE!</div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">+{luckyStrikeEvent} bonus XP</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
