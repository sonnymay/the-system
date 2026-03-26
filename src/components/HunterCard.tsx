import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

export default function HunterCard() {
  const profile = useStore((s) => s.profile)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  if (!profile) return null


  const rank = profile.hunter_rank as HunterRank
  const rc = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)

  return (
    <div className="px-6 pt-10 pb-8">
      {/* Rank + level */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <motion.div
            key={rank}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            className="font-black leading-none mb-1"
            style={{ fontSize: 72, color: rc.color, letterSpacing: '-2px' }}
          >
            {rank}
          </motion.div>
          <p className="text-sm font-medium" style={{ color: '#505060' }}>
            {rank}-Rank · Level {profile.level}
          </p>
        </div>

        <div className="text-right pb-1">
          <p className="font-semibold text-white text-base">{profile.username}</p>
          <p className="text-xs mt-0.5 italic" style={{ color: '#404050' }}>"{rc.identity}"</p>
        </div>
      </div>

      {/* XP bar */}
      <div>
        <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: '#13131e' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: rc.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#303040' }}>
            {progress.current.toLocaleString()} XP
          </span>
          <span className="text-xs" style={{ color: '#303040' }}>
            {progress.needed.toLocaleString()} XP
            {isPerfectDay && <span className="ml-2" style={{ color: '#f59e0b' }}>✦ 2×</span>}
          </span>
        </div>
      </div>
    </div>
  )
}
