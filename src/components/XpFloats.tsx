import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function XpFloats() {
  const xpGainEvents = useStore((s) => s.xpGainEvents)

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {xpGainEvents.map((event, idx) => (
          <motion.div
            key={`${idx}-${event.amount}`}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, y: -60, x: (idx % 2 === 0 ? 1 : -1) * 8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute text-sm font-black"
            style={{
              left: Math.min(Math.max(event.x - 20, 20), window.innerWidth - 80),
              top: Math.max(event.y - 10, 60),
              color: '#f59e0b',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
            }}
          >
            +{event.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
