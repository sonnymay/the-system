import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

export default function HunterCard() {
  const profile = useStore((s) => s.profile)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        {/* Rank badge */}
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

      {/* XP bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-1.5">
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
        <span>{progress.needed.toLocaleString()} XP</span>
      </div>
    </div>
  )
}
