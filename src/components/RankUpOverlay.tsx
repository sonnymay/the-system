import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { RANK_CONFIG } from '../lib/types'

export default function RankUpOverlay() {
  const rankUpEvent = useStore((s) => s.rankUpEvent)
  const clearRankUpEvent = useStore((s) => s.clearRankUpEvent)

  useEffect(() => {
    if (rankUpEvent) {
      const t = setTimeout(clearRankUpEvent, 5000)
      return () => clearTimeout(t)
    }
  }, [rankUpEvent, clearRankUpEvent])

  return (
    <AnimatePresence>
      {rankUpEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-8"
          style={{ background: 'rgba(8,8,14,0.95)' }}
          onClick={clearRankUpEvent}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="text-center"
          >
            <p className="text-xs font-semibold tracking-widest mb-6"
              style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}>
              RANK UP
            </p>

            <div
              className="font-black leading-none mb-4"
              style={{
                fontSize: 96,
                color: RANK_CONFIG[rankUpEvent.toRank].color,
                letterSpacing: '-4px',
              }}
            >
              {rankUpEvent.toRank}
            </div>

            <p className="text-xl font-bold text-white mb-2">
              {rankUpEvent.toRank}-Rank Hunter
            </p>
            <p className="text-sm" style={{ color: '#505060' }}>Level {rankUpEvent.level}</p>

            <div className="mt-8 px-6 py-4 rounded-2xl inline-block"
              style={{ background: '#0f0f18' }}>
              <p className="text-sm italic" style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}>
                "{RANK_CONFIG[rankUpEvent.toRank].identity}"
              </p>
            </div>

            <p className="text-xs mt-8" style={{ color: '#252530' }}>tap to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
