import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useTheme } from '../lib/theme'

export default function BossBattle() {
  const boss = useStore((s) => s.boss)
  const t = useTheme()

  if (!boss) return null

  const hpPercent = Math.max(0, Math.min(100, ((boss.maxHp - boss.hits) / boss.maxHp) * 100))
  const hpColor = hpPercent > 60 ? '#ef4444' : hpPercent > 30 ? '#f97316' : '#fbbf24'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{
        background: boss.defeated
          ? (t.darkMode ? '#14261a' : '#f0fdf4')
          : (t.darkMode ? '#1a0e0e' : '#fff5f5'),
        border: `1.5px solid ${boss.defeated ? '#22c55e30' : '#ef444430'}`,
      }}
    >
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wider"
              style={{ color: boss.defeated ? '#22c55e' : '#ef4444' }}>
              {boss.defeated ? '✓ BOSS DEFEATED' : '⚔️ WEEKLY BOSS'}
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{
                background: boss.defeated ? '#dcfce7' : '#fee2e2',
                color: boss.defeated ? '#16a34a' : '#dc2626',
              }}>
              +{boss.xpReward} XP
            </span>
          </div>
          <span className="text-xs" style={{ color: t.textMuted }}>
            {boss.defeated ? 'See you next week' : `${boss.hits}/${boss.maxHp} hits`}
          </span>
        </div>

        {/* Boss row */}
        <div className="flex items-center gap-3 mb-2.5">
          <motion.span
            animate={boss.defeated ? {} : { rotate: [0, -5, 5, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="text-3xl flex-shrink-0"
            style={{ filter: boss.defeated ? 'grayscale(0.8) opacity(0.6)' : undefined }}
          >
            {boss.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate"
              style={{ color: boss.defeated ? t.textMuted : t.text,
                textDecoration: boss.defeated ? 'line-through' : undefined }}>
              {boss.name}
            </p>
            <p className="text-xs" style={{ color: t.textMuted }}>{boss.description}</p>
          </div>
          {boss.defeated && (
            <span className="text-xl flex-shrink-0">🏆</span>
          )}
        </div>

        {/* HP bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: t.border }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: boss.defeated ? '#22c55e' : hpColor }}
            animate={{ width: boss.defeated ? '100%' : `${hpPercent}%` }}
            initial={false}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {!boss.defeated && (
          <p className="text-xs mt-1.5 text-center" style={{ color: t.textMuted }}>
            Complete habits &amp; tasks to deal damage
          </p>
        )}
      </div>
    </motion.div>
  )
}
