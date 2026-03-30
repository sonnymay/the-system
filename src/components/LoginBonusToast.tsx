import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function LoginBonusToast() {
  const loginBonusEvent = useStore((s) => s.loginBonusEvent)
  const loginStreak = useStore((s) => s.loginStreak)
  const clearLoginBonusEvent = useStore((s) => s.clearLoginBonusEvent)

  useEffect(() => {
    if (!loginBonusEvent) return
    const id = setTimeout(clearLoginBonusEvent, 3500)
    return () => clearTimeout(id)
  }, [loginBonusEvent, clearLoginBonusEvent])

  return (
    <AnimatePresence>
      {loginBonusEvent && (
        <motion.div
          key="login-bonus"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl"
          style={{ background: '#059669', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          <span className="text-sm font-semibold text-white">
            📅 Day {loginStreak} login bonus — +{loginBonusEvent} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
