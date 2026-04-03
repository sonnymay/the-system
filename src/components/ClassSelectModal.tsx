import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CHARACTER_CLASSES } from '../lib/types'
import type { CharacterClass } from '../lib/types'
import { useTheme } from '../lib/theme'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ClassSelectModal({ open, onClose }: Props) {
  const setCharacterClass = useStore((s) => s.setCharacterClass)
  const profile = useStore((s) => s.profile)
  const t = useTheme()

  function handleSelect(cls: CharacterClass) {
    setCharacterClass(cls)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl"
            style={{ background: t.card }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="font-bold text-base" style={{ color: t.text }}>Choose Your Class</p>
                <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                  {profile.characterClass ? 'Switch your class' : 'You reached Lv 10 — unlock your path'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: t.buttonBg }}
              >
                <X size={13} style={{ color: t.textMuted }} />
              </button>
            </div>

            {/* Class cards */}
            <div className="mt-3 space-y-2">
              {CHARACTER_CLASSES.map((cls) => {
                const isSelected = profile.characterClass === cls.id
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelect(cls.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isSelected ? cls.color + '18' : t.cardAlt,
                      border: `1.5px solid ${isSelected ? cls.color : 'transparent'}`,
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">{cls.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: isSelected ? cls.color : t.text }}>
                          {cls.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: cls.color + '22', color: cls.color }}>
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{cls.description}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: cls.color }}>{cls.bonusLine}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
