import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Share2, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress, getStreakMultiplier, ACHIEVEMENTS } from '../lib/types'
import { shareHunterCard } from '../lib/shareCard'
import { useTheme } from '../lib/theme'

const RANK_IMAGES: Partial<Record<HunterRank, string>> = {
  E: '/ranks/e-rank.png',
  D: '/ranks/d-rank.png',
  C: '/ranks/c-rank.png',
  B: '/ranks/b-rank.png',
  A: '/ranks/a-rank.png',
  S: '/ranks/s-rank.png',
}

const RANKS: HunterRank[] = ['E', 'D', 'C', 'B', 'A', 'S']

export default function HunterCard() {
  const profile = useStore((s) => s.profile)
  const quests = useStore((s) => s.quests)
  const isPerfectDay = useStore((s) => s.isPerfectDay)
  const updateUsername = useStore((s) => s.updateUsername)
  const loginStreak = useStore((s) => s.loginStreak)
  const t = useTheme()

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.username)
  const [sharing, setSharing] = useState(false)
  const [showRankInfo, setShowRankInfo] = useState(false)

  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)
  const image = RANK_IMAGES[rank]
  const maxStreak = quests.length > 0 ? Math.max(...quests.map((q) => q.current_streak)) : 0
  const multiplier = getStreakMultiplier(maxStreak)

  const nextRankIdx = RANKS.indexOf(rank) + 1
  const nextRank = nextRankIdx < RANKS.length ? RANKS[nextRankIdx] : null
  const levelsToRankUp = nextRank ? rc.levels[1] - profile.level + 1 : null

  // Compute unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => {
    switch (a.id) {
      case 'first_task':  return profile.total_tasks_completed >= 1
      case 'first_habit': return maxStreak >= 1
      case 'streak_3':    return maxStreak >= 3
      case 'streak_7':    return maxStreak >= 7
      case 'streak_30':   return maxStreak >= 30
      case 'tasks_10':    return profile.total_tasks_completed >= 10
      case 'tasks_50':    return profile.total_tasks_completed >= 50
      case 'perfect_day': return isPerfectDay
      case 'multiplier':  return multiplier > 1.0
      case 'level_20':    return profile.level >= 20
      case 's_rank':      return rank === 'S'
      default: return false
    }
  })

  function saveName() {
    const trimmed = nameInput.trim()
    if (trimmed) updateUsername(trimmed)
    else setNameInput(profile.username)
    setEditing(false)
  }

  async function handleShare() {
    setSharing(true)
    await shareHunterCard(profile, maxStreak, progress.percent)
    setSharing(false)
  }

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: t.card }}>

      {/* Character artwork */}
      {image ? (
        <div className="relative">
          <img src={image} alt={`${rank}-Rank Hunter`} style={{ display: 'block', width: '100%' }} />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: '72px', background: `linear-gradient(to bottom, transparent, ${t.card})` }}
          />
          {isPerfectDay && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: '#fef3c7', color: '#d97706' }}>✦ 2× XP</span>
            </div>
          )}
          {multiplier > 1.0 && !isPerfectDay && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: rc.color + '20', color: rc.color }}>{multiplier}× streak</span>
            </div>
          )}
          {multiplier > 1.0 && isPerfectDay && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: rc.color + '20', color: rc.color }}>{multiplier}× streak</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 pt-5 flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: rc.color + '15', color: rc.color }}>{rank}</div>
          <div className="flex items-center gap-2">
            {multiplier > 1.0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: rc.color + '15', color: rc.color }}>{multiplier}× streak</span>
            )}
            {isPerfectDay && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#fef3c7', color: '#d97706' }}>✦ 2× XP</span>
            )}
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="px-5 pt-3 pb-5">
        {/* Name row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Rank badge — tap to show rank info */}
          <button
            onClick={() => setShowRankInfo(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 transition-transform active:scale-95"
            style={{ background: rc.color }}
            title={`${rc.title} — tap for rank info`}
          >
            {rank}
          </button>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input autoFocus value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="font-bold bg-transparent border-b-2 outline-none w-full"
                style={{ color: t.text, borderColor: rc.color }} maxLength={24} />
            ) : (
              <button onClick={() => { setNameInput(profile.username); setEditing(true) }}
                className="font-bold text-left leading-tight block truncate w-full group"
                style={{ color: t.text }}>
                {profile.username}
                <span className="ml-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: t.textMuted }}>✏️</span>
              </button>
            )}
            <p className="text-xs" style={{ color: t.textMuted }}>{rc.title} · Lv {profile.level}</p>
          </div>

          {/* Share button */}
          <button onClick={handleShare} disabled={sharing}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: t.buttonBg }} title="Share card">
            <Share2 size={13} style={{ color: t.textMuted }} />
          </button>
        </div>

        {/* XP bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: t.border }}>
          <motion.div
            key={profile.level}
            className="h-full rounded-full"
            style={{ background: rc.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
        <div className="flex justify-between text-xs mb-3" style={{ color: t.textMuted }}>
          <span>{progress.current.toLocaleString()} XP</span>
          <span>{progress.needed.toLocaleString()} XP to Lv {profile.level + 1}</span>
        </div>

        {/* Achievement badges */}
        {unlockedAchievements.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {unlockedAchievements.slice(0, 6).map((a) => (
              <span
                key={a.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: t.buttonBg, color: t.textSub }}
                title={a.name + ': ' + a.description}
              >
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: t.textMuted }}>
          {maxStreak > 0 && <span>🔥 {maxStreak} day streak</span>}
          {loginStreak > 1 && <span>📅 {loginStreak} day login</span>}
          <span>⚔️ {profile.total_tasks_completed} done</span>
          {levelsToRankUp !== null && (
            <span className="ml-auto font-medium" style={{ color: RANK_CONFIG[nextRank!].color }}>
              {levelsToRankUp} lvl to {nextRank}-Rank
            </span>
          )}
          {!nextRank && <span className="ml-auto font-medium" style={{ color: rc.color }}>MAX RANK</span>}
        </div>

        {/* Identity quote */}
        <p className="text-xs mt-2.5 italic" style={{ color: rc.color + '99' }}>
          "{rc.identity}"
        </p>
      </div>

      {/* Rank Info Modal */}
      <AnimatePresence>
        {showRankInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowRankInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="rounded-3xl p-6 w-full max-w-xs shadow-2xl"
              style={{ background: t.card }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                    style={{ background: rc.color }}>{rank}</div>
                  <div>
                    <p className="font-bold" style={{ color: t.text }}>{rc.title}</p>
                    <p className="text-xs" style={{ color: t.textMuted }}>
                      Lv {rc.levels[0]}–{rc.levels[1]}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowRankInfo(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: t.buttonBg }}>
                  <X size={13} style={{ color: t.textMuted }} />
                </button>
              </div>

              <p className="text-sm italic mb-4" style={{ color: rc.color }}>
                "{rc.identity}"
              </p>

              {/* All ranks overview */}
              <div className="space-y-1.5">
                {RANKS.map((r) => {
                  const rrc = RANK_CONFIG[r]
                  const isCurrent = r === rank
                  return (
                    <div key={r} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl"
                      style={{ background: isCurrent ? rc.color + '12' : 'transparent' }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: rrc.color }}>{r}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold" style={{ color: isCurrent ? rrc.color : t.textSub }}>
                          {rrc.title}
                        </span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: t.textMuted }}>
                        Lv {rrc.levels[0]}–{rrc.levels[1]}
                      </span>
                    </div>
                  )
                })}
              </div>

              {nextRank && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: t.border }}>
                  <p className="text-xs text-center" style={{ color: t.textMuted }}>
                    {levelsToRankUp} more level{levelsToRankUp !== 1 ? 's' : ''} to reach{' '}
                    <span className="font-semibold" style={{ color: RANK_CONFIG[nextRank].color }}>
                      {RANK_CONFIG[nextRank].title}
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
