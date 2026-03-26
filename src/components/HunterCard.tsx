import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

const RANK_IMAGES: Partial<Record<HunterRank, string>> = {
  E: '/ranks/e-rank.png',
  // D: '/ranks/d-rank.png',
  // C: '/ranks/c-rank.png',
  // B: '/ranks/b-rank.png',
  // A: '/ranks/a-rank.png',
  // S: '/ranks/s-rank.png',
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

      {/* Character artwork — object-contain ensures full body is visible */}
      {image ? (
        <div className="relative" style={{ background: '#0e1118' }}>
          <img
            src={image}
            alt={`${rank}-Rank Hunter`}
            style={{
              display: 'block',
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              objectPosition: 'center bottom',
            }}
          />
          {/* Fade bottom of artwork into white */}
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
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
              style={{ background: rc.color + '20', color: rc.color }}
            >
              {rank}
            </div>
            <div>
              <p className="font-bold text-gray-900">{profile.username}</p>
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

      {/* Info + XP */}
      <div className="px-5 pt-3 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
            style={{ background: rc.color }}
          >
            {rank}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 leading-tight truncate">{profile.username}</p>
            <p className="text-xs text-gray-400">{rank}-Rank · Level {profile.level}</p>
          </div>
          {isPerfectDay && image && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: '#fef3c7', color: '#d97706' }}>
              ✦ 2× XP
            </span>
          )}
        </div>

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
