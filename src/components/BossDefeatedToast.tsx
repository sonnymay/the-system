import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useStore } from '../store/useStore'

export default function BossDefeatedToast() {
  const boss = useStore((s) => s.boss)
  const bossDefeatedEvent = useStore((s) => s.bossDefeatedEvent)
  const clearBossDefeatedEvent = useStore((s) => s.clearBossDefeatedEvent)
  const fired = useRef(false)

  useEffect(() => {
    if (!bossDefeatedEvent) return
    if (!fired.current) {
      fired.current = true
      // Red + gold confetti blast
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#dc2626', '#fbbf24', '#f59e0b', '#ffffff'] })
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors: ['#dc2626', '#fbbf24'] })
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors: ['#dc2626', '#fbbf24'] })
      }, 300)
    }
    const id = setTimeout(() => { clearBossDefeatedEvent(); fired.current = false }, 4000)
    return () => clearTimeout(id)
  }, [bossDefeatedEvent, clearBossDefeatedEvent])

  return (
    <AnimatePresence>
      {bossDefeatedEvent && boss && (
        <motion.div
          key="boss-defeated"
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          className="fixed top-16 left-1/2 z-50 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
            transform: 'translateX(-50%)',
            border: '1.5px solid #fca5a5',
          }}
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6 }}
            className="text-3xl"
          >
            🏆
          </motion.span>
          <p className="text-white font-black text-sm tracking-wide">BOSS DEFEATED!</p>
          <p className="text-red-200 text-xs font-medium">{boss.emoji} {boss.name} — +{boss.xpReward} XP</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
