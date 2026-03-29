import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const STEPS = [
  {
    icon: '🌱',
    title: 'Build daily habits',
    body: 'Add up to 3 habits below. Check them off each day to build your streak and earn XP.',
  },
  {
    icon: '⚡',
    title: 'Unlock 2× XP',
    body: 'Complete all 3 habits in a day to activate Perfect Day mode — every task earns double XP.',
  },
  {
    icon: '⚔️',
    title: 'Level up your rank',
    body: 'Add tasks, complete them, and watch your Hunter rank climb from E all the way to S.',
  },
]

export default function OnboardingTutorial() {
  const hasOnboarded = useStore((s) => s.hasOnboarded)
  const tutorialDone = useStore((s) => s.tutorialDone)
  const setTutorialDone = useStore((s) => s.setTutorialDone)
  const [step, setStep] = useState(0)

  if (!hasOnboarded || tutorialDone) return null

  function advance() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setTutorialDone()
    }
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-end justify-center px-4 pb-8"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={advance}
      >
        <motion.div
          key={step}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-4xl mb-4">{current.icon}</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{current.body}</p>

          {/* Step dots */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '20px' : '6px',
                    background: i === step ? '#6366f1' : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            <button
              onClick={advance}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#6366f1' }}
            >
              {step < STEPS.length - 1 ? 'Next' : "Let's go"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
