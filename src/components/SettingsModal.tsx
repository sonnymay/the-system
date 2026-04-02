import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings, X, Plus, Trash2, Sun, Moon, Download, Upload, AlertTriangle, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store/useStore'
import { RANK_CONFIG } from '../lib/types'
import type { HunterRank } from '../lib/types'
import { useTheme } from '../lib/theme'

export default function SettingsModal() {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [showNewProfile, setShowNewProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileSlots = useStore((s) => s.profileSlots)
  const activeSlotId = useStore((s) => s.activeSlotId)
  const resetProgress = useStore((s) => s.resetProgress)
  const switchProfile = useStore((s) => s.switchProfile)
  const createProfile = useStore((s) => s.createProfile)
  const deleteProfile = useStore((s) => s.deleteProfile)
  const darkMode = useStore((s) => s.darkMode)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)
  const soundEnabled = useStore((s) => s.soundEnabled)
  const toggleSound = useStore((s) => s.toggleSound)
  const xpPenaltyEnabled = useStore((s) => s.xpPenaltyEnabled)
  const toggleXpPenalty = useStore((s) => s.toggleXpPenalty)

  const t = useTheme()

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

  function handleExport() {
    const raw = localStorage.getItem('the-system')
    if (!raw) return
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `the-system-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        JSON.parse(text) // validate JSON
        localStorage.setItem('the-system', text)
        window.location.reload()
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function close() {
    setOpen(false)
    setConfirmReset(false)
    setShowNewProfile(false)
    setNewProfileName('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: t.buttonBg }}
      >
        <Settings size={15} style={{ color: t.textSub }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl"
              style={{ background: t.card }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold" style={{ color: t.text }}>Settings</h2>
                <button onClick={close}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: t.buttonBg }}>
                  <X size={13} style={{ color: t.textSub }} />
                </button>
              </div>

              {/* Preferences */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Preferences</p>
              <div className="space-y-2 mb-5">
                {/* Dark mode */}
                <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: t.cardAlt }}>
                  <div className="flex items-center gap-2.5">
                    {darkMode ? <Moon size={15} style={{ color: t.textSub }} /> : <Sun size={15} style={{ color: t.textSub }} />}
                    <span className="text-sm font-medium" style={{ color: t.text }}>Dark Mode</span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200"
                    style={{ background: darkMode ? '#6366f1' : '#d1d5db' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      style={{ transform: darkMode ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* Sound effects */}
                <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: t.cardAlt }}>
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? <Volume2 size={15} style={{ color: t.textSub }} /> : <VolumeX size={15} style={{ color: t.textSub }} />}
                    <span className="text-sm font-medium" style={{ color: t.text }}>Sound Effects</span>
                  </div>
                  <button
                    onClick={toggleSound}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200"
                    style={{ background: soundEnabled ? '#6366f1' : '#d1d5db' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      style={{ transform: soundEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* XP Penalty */}
                <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: t.cardAlt }}>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <AlertTriangle size={15} className="text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium block" style={{ color: t.text }}>XP Penalty</span>
                      <span className="text-xs" style={{ color: t.textMuted }}>Lose XP if you skip habits</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleXpPenalty}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-3"
                    style={{ background: xpPenaltyEnabled ? '#f97316' : '#d1d5db' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      style={{ transform: xpPenaltyEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Data */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Data</p>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: t.buttonBg, color: t.textSub }}
                >
                  <Download size={14} />
                  Export backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: t.buttonBg, color: t.textSub }}
                >
                  <Upload size={14} />
                  Import backup
                </button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>

              {/* Profiles */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Profiles</p>
              <div className="space-y-2 mb-5">
                {profileSlots.map((slot) => {
                  const slotRc = RANK_CONFIG[slot.profile.hunter_rank as HunterRank]
                  const isActive = slot.id === activeSlotId
                  return (
                    <div key={slot.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: isActive ? slotRc.color : 'transparent',
                        background: isActive ? slotRc.color + '08' : t.cardAlt,
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: slotRc.color }}>
                        {slot.profile.hunter_rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{slot.profile.username}</p>
                        <p className="text-xs" style={{ color: t.textMuted }}>{slotRc.title} · Lv {slot.profile.level}</p>
                      </div>
                      {!isActive && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { switchProfile(slot.id); close() }}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: slotRc.color + '15', color: slotRc.color }}>
                            Switch
                          </button>
                          {profileSlots.length > 1 && (
                            <button onClick={() => deleteProfile(slot.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                              style={{ color: t.textMuted }}>
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                      {isActive && <span className="text-xs" style={{ color: t.textMuted }}>Active</span>}
                    </div>
                  )
                })}

                {profileSlots.length < 3 && !showNewProfile && (
                  <button onClick={() => setShowNewProfile(true)}
                    className="w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed text-sm transition-colors"
                    style={{ borderColor: t.border, color: t.textMuted }}>
                    <Plus size={14} /> New profile
                  </button>
                )}

                {showNewProfile && (
                  <form onSubmit={handleCreateProfile} className="flex gap-2">
                    <input autoFocus value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Profile name" maxLength={20}
                      className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                      style={{ borderColor: t.border, background: t.inputBg, color: t.text }} />
                    <button type="submit" disabled={!newProfileName.trim()}
                      className="px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                      style={{ background: '#6366f1' }}>
                      Create
                    </button>
                  </form>
                )}
              </div>

              {/* Reset */}
              <div className="border-t pt-4" style={{ borderColor: t.border }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Danger Zone</p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: confirmReset ? '#fee2e2' : t.buttonBg,
                    color: confirmReset ? '#dc2626' : t.textSub,
                    border: confirmReset ? '2px solid #fca5a5' : '2px solid transparent',
                  }}
                >
                  {confirmReset ? 'Tap again to confirm reset' : 'Reset Progress'}
                </button>
                {confirmReset && (
                  <p className="text-xs text-center mt-2" style={{ color: t.textMuted }}>
                    This will reset XP, tasks, and habits for this profile.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
