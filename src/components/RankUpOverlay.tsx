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
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={clearRankUpEvent}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black mx-auto mb-4"
              style={{
                background: RANK_CONFIG[rankUpEvent.toRank].color + '18',
                color: RANK_CONFIG[rankUpEvent.toRank].color,
              }}
            >
              {rankUpEvent.toRank}
            </div>

            <p className="text-xs font-semibold tracking-widest mb-1"
              style={{ color: RANK_CONFIG[rankUpEvent.toRank].color }}>
              RANK UP
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{rankUpEvent.toRank}-Rank Hunter</h2>
            <p className="text-sm text-gray-400 mb-5">Level {rankUpEvent.level}</p>

            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-600 italic">
                "{RANK_CONFIG[rankUpEvent.toRank].identity}"
              </p>
            </div>

            <p className="text-xs text-gray-300 mt-4">tap to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
