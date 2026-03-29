import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function UndoToast() {
  const undoSnapshot = useStore((s) => s.undoSnapshot)
  const triggerUndo = useStore((s) => s.triggerUndo)
  const clearUndo = useStore((s) => s.clearUndo)

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!undoSnapshot) return
    const id = setTimeout(clearUndo, 5000)
    return () => clearTimeout(id)
  }, [undoSnapshot, clearUndo])

  return (
    <AnimatePresence>
      {undoSnapshot && (
        <motion.div
          key="undo-toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl"
          style={{
            background: '#1f2937',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="text-sm text-gray-300">
            ✓ {undoSnapshot.label} done
          </span>
          <button
            onClick={triggerUndo}
            className="text-sm font-semibold px-3 py-1 rounded-full transition-colors"
            style={{ background: '#374151', color: '#60a5fa' }}
          >
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
