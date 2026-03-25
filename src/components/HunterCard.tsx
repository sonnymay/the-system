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
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden p-6"
      style={{
        background: '#111118',
        border: `1px solid ${rc.color}30`,
      }}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${rc.color}80, transparent)` }} />

      <div className="flex items-start justify-between mb-6">
        {/* Left: name + rank */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: rc.color, letterSpacing: '0.12em' }}>
            {rank}-RANK HUNTER
          </p>
          <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
          <p className="text-sm mt-0.5 italic" style={{ color: '#555570' }}>"{rc.identity}"</p>
        </div>

        {/* Right: big rank badge */}
        <div
          className="flex items-center justify-center rounded-2xl w-16 h-16 text-3xl font-black"
          style={{
            background: `${rc.color}15`,
            border: `2px solid ${rc.color}50`,
            color: rc.color,
            boxShadow: `0 0 24px ${rc.color}25`,
          }}
        >
          {rank}
        </div>
      </div>

      {/* Level + XP bar */}
      <div className="mb-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-white">Level {profile.level}</span>
          <span className="text-xs" style={{ color: '#555570' }}>
            {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e2e' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${rc.color}cc, ${rc.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Stat label="Tasks Done" value={profile.total_tasks_completed.toLocaleString()} />
        <div className="w-px" style={{ background: '#2a2a3a' }} />
        <Stat label="Total XP" value={
          profile.total_xp >= 1000
            ? `${(profile.total_xp / 1000).toFixed(1)}k`
            : profile.total_xp.toLocaleString()
        } />
        {isPerfectDay && (
          <>
            <div className="w-px" style={{ background: '#2a2a3a' }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>✦ Perfect Day</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                style={{ background: '#f59e0b20', color: '#f59e0b' }}>2×</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: '#555570' }}>{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
