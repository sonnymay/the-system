import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings, X, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { RANK_CONFIG } from '../lib/types'
import type { HunterRank } from '../lib/types'

export default function SettingsModal() {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [showNewProfile, setShowNewProfile] = useState(false)

  const profileSlots = useStore((s) => s.profileSlots)
  const activeSlotId = useStore((s) => s.activeSlotId)
  const resetProgress = useStore((s) => s.resetProgress)
  const switchProfile = useStore((s) => s.switchProfile)
  const createProfile = useStore((s) => s.createProfile)
  const deleteProfile = useStore((s) => s.deleteProfile)


  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    resetProgress()
    setConfirmReset(false)
    setOpen(false)
  }

  function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!newProfileName.trim()) return
    createProfile(newProfileName.trim())
    setNewProfileName('')
    setShowNewProfile(false)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-200"
        style={{ background: '#ebebeb' }}
      >
        <Settings size={15} className="text-gray-500" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setOpen(false); setConfirmReset(false) }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Settings</h2>
                <button onClick={() => { setOpen(false); setConfirmReset(false) }}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={13} className="text-gray-500" />
                </button>
              </div>

              {/* Profiles */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profiles</p>
              <div className="space-y-2 mb-4">
                {profileSlots.map((slot) => {
                  const slotRc = RANK_CONFIG[slot.profile.hunter_rank as HunterRank]
                  const isActive = slot.id === activeSlotId
                  return (
                    <div key={slot.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                      style={{ borderColor: isActive ? slotRc.color : 'transparent', background: isActive ? slotRc.color + '08' : '#f9fafb' }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: slotRc.color }}>
                        {slot.profile.hunter_rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{slot.profile.username}</p>
                        <p className="text-xs text-gray-400">{slotRc.title} · Lv {slot.profile.level}</p>
                      </div>
                      {!isActive && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { switchProfile(slot.id); setOpen(false) }}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: slotRc.color + '15', color: slotRc.color }}>
                            Switch
                          </button>
                          {profileSlots.length > 1 && (
                            <button onClick={() => deleteProfile(slot.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                      {isActive && <span className="text-xs text-gray-400">Active</span>}
                    </div>
                  )
                })}

                {profileSlots.length < 3 && !showNewProfile && (
                  <button onClick={() => setShowNewProfile(true)}
                    className="w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 transition-colors text-sm">
                    <Plus size={14} /> New profile
                  </button>
                )}

                {showNewProfile && (
                  <form onSubmit={handleCreateProfile} className="flex gap-2">
                    <input autoFocus value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Profile name" maxLength={20}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb' }} />
                    <button type="submit" disabled={!newProfileName.trim()}
                      className="px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                      style={{ background: '#6366f1' }}>
                      Create
                    </button>
                  </form>
                )}
              </div>

              {/* Reset */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Danger Zone</p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: confirmReset ? '#fee2e2' : '#f9fafb',
                    color: confirmReset ? '#dc2626' : '#6b7280',
                    border: confirmReset ? '2px solid #fca5a5' : '2px solid transparent',
                  }}
                >
                  {confirmReset ? 'Tap again to confirm reset' : 'Reset Progress'}
                </button>
                {confirmReset && (
                  <p className="text-xs text-center text-gray-400 mt-2">This will reset XP, tasks, and habits for this profile.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
