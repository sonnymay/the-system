import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { RANK_CONFIG } from '../lib/types'

export default function RankUpOverlay() {
  const rankUpEvent = useStore((s) => s.rankUpEvent)
  const clearRankUpEvent = useStore((s) => s.clearRankUpEvent)

  useEffect(() => {
    if (rankUpEvent) {
      const timer = setTimeout(clearRankUpEvent, 5000)
      return () => clearTimeout(timer)
    }
  }, [rankUpEvent, clearRankUpEvent])

  return (
    <AnimatePresence>
      {rankUpEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={clearRankUpEvent}
        >
          {/* Particle beams */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, delay: i * 0.1 }}
            >
              <div
                className="absolute origin-center"
                style={{
                  width: '200vmax',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${RANK_CONFIG[rankUpEvent.toRank].color}, transparent)`,
                  transform: `rotate(${i * 45}deg)`,
                  opacity: 0.4,
                }}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="relative text-center px-8 py-10 rounded-3xl max-w-sm mx-4"
            style={{
              background: 'linear-gradient(135deg, #12121a, #1a1a2e)',
              border: `2px solid ${RANK_CONFIG[rankUpEvent.toRank].color}`,
              boxShadow: `0 0 60px ${RANK_CONFIG[rankUpEvent.toRank].glow}`,
            }}
          >
            {/* Old rank → new rank */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black mb-1" style={{ color: RANK_CONFIG[rankUpEvent.fromRank].color }}>
                  {rankUpEvent.fromRank}
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>from</div>
              </div>

              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl"
              >
                ⚔️
              </motion.div>

              <div className="text-center">
                <motion.div
                  animate={{ textShadow: [`0 0 10px ${RANK_CONFIG[rankUpEvent.toRank].color}`, `0 0 30px ${RANK_CONFIG[rankUpEvent.toRank].color}`, `0 0 10px ${RANK_CONFIG[rankUpEvent.toRank].color}`] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-3xl font-black mb-1"
                  style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}
                >
                  {rankUpEvent.toRank}
                </motion.div>
                <div className="text-xs" style={{ color: '#6b7280' }}>to</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}>
                RANK UP!
              </p>
              <h2 className="text-2xl font-black text-white mb-1">
                {rankUpEvent.toRank}-Rank Hunter
              </h2>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Level {rankUpEvent.level} reached
              </p>

              <div className="py-3 px-4 rounded-xl" style={{ background: '#0a0a0f' }}>
                <p className="text-sm italic" style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}>
                  "{rankUpEvent.identity}"
                </p>
              </div>
            </motion.div>

            <p className="text-xs mt-4" style={{ color: '#4b5563' }}>Tap to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
