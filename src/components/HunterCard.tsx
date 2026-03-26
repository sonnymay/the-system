import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

const RANK_IMAGES: Partial<Record<HunterRank, string>> = {
  E: '/ranks/e-rank.png',
  // D: '/ranks/d-rank.jpg',
  // C: '/ranks/c-rank.jpg',
  // B: '/ranks/b-rank.jpg',
  // A: '/ranks/a-rank.jpg',
  // S: '/ranks/s-rank.jpg',
}

export default function HunterCard() {
  const profile = useStore((s) => s.profile)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)
  const image = RANK_IMAGES[rank]

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Character image banner */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={`${rank}-Rank Hunter`}
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient fade at bottom */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 40%, white 100%)' }} />

          {/* Rank badge overlay */}
          <div className="absolute bottom-3 left-4 flex items-end gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-sm"
              style={{ background: rc.color, color: 'white' }}
            >
              {rank}
            </div>
            <div className="pb-0.5">
              <p className="font-bold text-gray-900 leading-tight">{profile.username}</p>
              <p className="text-xs text-gray-400">{rank}-Rank · Lv {profile.level}</p>
            </div>
          </div>

          {isPerfectDay && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ background: '#fef3c7', color: '#d97706' }}>
                ✦ 2× XP
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fallback: no image yet */}
      {!image && (
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
              style={{ background: rc.color + '18', color: rc.color }}
            >
              {rank}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{profile.username}</p>
              <p className="text-sm text-gray-400">{rank}-Rank · Lv {profile.level}</p>
            </div>
          </div>
          {isPerfectDay && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: '#fef3c7', color: '#d97706' }}>
              ✦ 2× XP
            </span>
          )}
        </div>
      )}

      {/* XP bar */}
      <div className="px-5 pb-5" style={{ paddingTop: image ? '0' : '0' }}>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: rc.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{progress.current.toLocaleString()} XP</span>
          <span>{progress.needed.toLocaleString()} XP to Lv {profile.level + 1}</span>
        </div>
      </div>
    </div>
  )
}
