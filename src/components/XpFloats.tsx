import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function XpFloats() {
  const xpGainEvents = useStore((s) => s.xpGainEvents)

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {xpGainEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute text-sm font-bold text-violet-600"
            style={{
              left: Math.min(Math.max(event.x - 20, 20), window.innerWidth - 80),
              top: Math.max(event.y - 10, 60),
            }}
          >
            +{event.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
