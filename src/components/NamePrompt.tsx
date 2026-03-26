import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function NamePrompt() {
  const hasOnboarded = useStore((s) => s.hasOnboarded)
  const updateUsername = useStore((s) => s.updateUsername)
  const setHasOnboarded = useStore((s) => s.setHasOnboarded)

  const [name, setName] = useState('')

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    updateUsername(trimmed)
    setHasOnboarded(true)
  }

  return (
    <AnimatePresence>
      {!hasOnboarded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: '#f5f5f7' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="max-w-xs w-full"
          >
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">The System</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, Hunter.</h1>
            <p className="text-sm text-gray-400 mb-8">What should we call you?</p>

            <form onSubmit={handleStart} className="space-y-3">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={24}
                className="w-full px-4 py-3 rounded-xl bg-white shadow-sm text-gray-900 font-medium outline-none border-2 border-transparent transition-all"
                style={{ borderColor: name.trim() ? '#6366f1' : 'transparent' }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-30"
                style={{ background: '#6366f1' }}
              >
                Begin
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
