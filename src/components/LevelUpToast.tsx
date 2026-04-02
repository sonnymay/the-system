import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { LEVEL_MILESTONES, getRankForLevel, RANK_CONFIG } from '../lib/types'

const MILESTONE_LABELS: Record<number, string> = {
  5:   'Getting Started',
  10:  'Rookie Hunter',
  15:  'Building Habits',
  20:  'Acolyte Ascended',
  25:  'Quarter Century',
  30:  'One Month Strong',
  40:  'Relentless',
  50:  'Half a Century',
  75:  'Elite Status',
  100: 'SHADOW MONARCH',
}

export default function LevelUpToast() {
  const levelUpEvent = useStore((s) => s.levelUpEvent)
  const clearLevelUpEvent = useStore((s) => s.clearLevelUpEvent)

  const isMilestone = levelUpEvent !== null && LEVEL_MILESTONES.includes(levelUpEvent)
  const duration = isMilestone ? 5000 : 2800

  useEffect(() => {
    if (levelUpEvent) {
      const t = setTimeout(clearLevelUpEvent, duration)
      return () => clearTimeout(t)
    }
  }, [levelUpEvent, clearLevelUpEvent, duration])

  if (!levelUpEvent) return null

  const rank = getRankForLevel(levelUpEvent)
  const rc = RANK_CONFIG[rank]

  return (
    <div className="fixed inset-0 flex items-start justify-center pointer-events-none z-50" style={{ top: '56px' }}>
      <AnimatePresence>
        {levelUpEvent && (
          isMilestone ? (
            // Big milestone celebration
            <motion.div
              key={`milestone-${levelUpEvent}`}
              initial={{ opacity: 0, scale: 0.7, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -15 }}
              transition={{ type: 'spring', damping: 16, stiffness: 260 }}
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-3xl shadow-2xl mx-4 text-center pointer-events-auto"
              style={{
                background: `linear-gradient(135deg, ${rc.color}22 0%, ${rc.color}44 100%)`,
                border: `2px solid ${rc.color}`,
                backdropFilter: 'blur(12px)',
                maxWidth: '320px',
              }}
            >
              {/* Particle row */}
              <div className="flex gap-1">
                {['⭐', '✨', '🌟', '✨', '⭐'].map((s, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="text-base"
                  >{s}</motion.span>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black tracking-tight"
                style={{ color: rc.color }}
              >
                LEVEL {levelUpEvent}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-semibold text-white"
              >
                {MILESTONE_LABELS[levelUpEvent]}
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="w-full h-0.5 rounded-full"
                style={{ background: rc.color }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-white/70"
              >
                {rc.title} · {rank}-Rank
              </motion.p>
            </motion.div>
          ) : (
            // Standard level up pill
            <motion.div
              key={`level-${levelUpEvent}`}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
              style={{ background: '#1a1a2e', color: rc.color }}
            >
              <span>⬆️</span>
              <span>Level {levelUpEvent}!</span>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
