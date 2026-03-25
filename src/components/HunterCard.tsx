import { motion } from 'framer-motion'
import { Shield, Zap, Trophy, Flame } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { HunterRank } from '../lib/types'
import { RANK_CONFIG, getLevelProgress } from '../lib/types'

export default function HunterCard() {
  const profile = useStore((s) => s.profile)
  const dailyQuests = useStore((s) => s.dailyQuests)
  const isPerfectDay = useStore((s) => s.isPerfectDay)

  if (!profile) return null

  const rank = profile.hunter_rank as HunterRank
  const rankConfig = RANK_CONFIG[rank]
  const progress = getLevelProgress(profile.level, profile.current_xp)
  const streak = dailyQuests.reduce((max, q) => Math.max(max, q.current_streak), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden p-5"
      style={{
        background: 'linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)',
        border: `1px solid ${rankConfig.glow.replace('0.6', '0.3')}`,
        boxShadow: `0 0 24px ${rankConfig.glow.replace('0.6', '0.15')}`,
      }}
    >
      {/* Background rank watermark */}
      <div
        className="absolute top-2 right-4 text-8xl font-black pointer-events-none select-none"
        style={{ color: rankConfig.glow.replace('0.6', '0.06'), lineHeight: 1 }}
      >
        {rank}
      </div>

      {isPerfectDay && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Zap size={10} />
            PERFECT DAY 2×
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Rank badge */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center rank-glow"
          style={{
            background: `linear-gradient(135deg, ${rankConfig.glow}, ${rankConfig.color}22)`,
            border: `2px solid ${rankConfig.color}`,
            color: rankConfig.color,
          }}
        >
          <span className="text-2xl font-black">{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${rankConfig.color}22`, color: rankConfig.color }}>
              {rank}-Rank Hunter
            </span>
          </div>
          <h2 className="text-xl font-bold text-white truncate">{profile.username}</h2>
          <p className="text-xs mt-0.5 italic" style={{ color: '#6b7280' }}>"{rankConfig.identity}"</p>
        </div>
      </div>

      {/* Level + XP bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Shield size={12} style={{ color: rankConfig.color }} />
            <span className="text-xs font-semibold" style={{ color: rankConfig.color }}>
              Level {profile.level}
            </span>
          </div>
          <span className="text-xs" style={{ color: '#6b7280' }}>
            {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
          </span>
        </div>

        {/* XP bar track */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a27' }}>
          <motion.div
            className="h-full rounded-full xp-bar-glow"
            style={{ background: `linear-gradient(90deg, ${rankConfig.color}, ${rankConfig.glow.replace('0.6', '1')})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: '#4b5563' }}>Lv {profile.level}</span>
          <span className="text-xs" style={{ color: '#4b5563' }}>Lv {profile.level + 1}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          icon={<Trophy size={12} />}
          label="Completed"
          value={profile.total_tasks_completed.toString()}
          color="#f59e0b"
        />
        <StatBox
          icon={<Flame size={12} />}
          label="Best Streak"
          value={`${streak}d`}
          color="#ef4444"
        />
        <StatBox
          icon={<Zap size={12} />}
          label="Total XP"
          value={profile.total_xp >= 1000 ? `${(profile.total_xp / 1000).toFixed(1)}k` : profile.total_xp.toString()}
          color="#7c3aed"
        />
      </div>
    </motion.div>
  )
}

function StatBox({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}>
      <div className="flex items-center justify-center gap-1 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs" style={{ color: '#6b7280' }}>{label}</span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  )
}
