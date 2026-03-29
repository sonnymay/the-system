import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

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

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.username)

  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)
  const image = RANK_IMAGES[rank]

  const maxStreak = quests.length > 0 ? Math.max(...quests.map((q) => q.current_streak)) : 0

  const nextRankIdx = RANKS.indexOf(rank) + 1
  const nextRank = nextRankIdx < RANKS.length ? RANKS[nextRankIdx] : null
  const levelsToRankUp = nextRank ? rc.levels[1] - profile.level + 1 : null

  function saveName() {
    const trimmed = nameInput.trim()
    if (trimmed) updateUsername(trimmed)
    else setNameInput(profile.username)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Character artwork */}
      {image ? (
        <div className="relative">
          <img
            src={image}
            alt={`${rank}-Rank Hunter`}
            style={{ display: 'block', width: '100%' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: '72px', background: 'linear-gradient(to bottom, transparent, white)' }}
          />
          {isPerfectDay && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: '#fef3c7', color: '#d97706' }}>
                ✦ 2× XP
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 pt-5 flex items-center justify-between">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: rc.color + '15', color: rc.color }}
          >
            {rank}
          </div>
          {isPerfectDay && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: '#fef3c7', color: '#d97706' }}>
              ✦ 2× XP
            </span>
          )}
        </div>
      )}

      {/* Info section */}
      <div className="px-5 pt-3 pb-5">
        {/* Name row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
            style={{ background: rc.color }}
          >
            {rank}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="font-bold text-gray-900 bg-transparent border-b-2 outline-none w-full"
                style={{ borderColor: rc.color }}
                maxLength={24}
              />
            ) : (
              <button
                onClick={() => { setNameInput(profile.username); setEditing(true) }}
                className="font-bold text-gray-900 text-left leading-tight block truncate w-full group"
              >
                {profile.username}
                <span className="ml-1.5 text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            )}
            <p className="text-xs text-gray-400">{rc.title} · Lv {profile.level}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: rc.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>{progress.current.toLocaleString()} XP</span>
          <span>{progress.needed.toLocaleString()} XP to Lv {profile.level + 1}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          {maxStreak > 0 && <span>🔥 {maxStreak} day streak</span>}
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
    </div>
  )
}
