import { useStore } from '../store/useStore'
import { RANK_CONFIG } from '../lib/types'
import type { HunterRank } from '../lib/types'
import { useTheme } from '../lib/theme'

const WEEKS = 13

export default function StreakCalendar() {
  const dailyActivity = useStore((s) => s.dailyActivity)
  const rank = useStore((s) => s.profile.hunter_rank) as HunterRank
  const t = useTheme()
  const rc = RANK_CONFIG[rank]

  // Build last WEEKS*7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalDays = WEEKS * 7
  const days: Array<{ date: string; habits: number }> = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, habits: dailyActivity[dateStr]?.habits ?? 0 })
  }

  // Group into columns (each column = 7 days, oldest on left)
  const weeks: Array<typeof days> = []
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7))
  }

  const totalActive = days.filter(d => d.habits > 0).length
  const totalPerfect = days.filter(d => d.habits >= 3).length

  function cellColor(habits: number): string {
    if (habits === 0) return t.border
    if (habits === 1) return rc.color + '40'
    if (habits === 2) return rc.color + '80'
    return rc.color
  }

  return (
    <div className="rounded-2xl shadow-sm px-5 py-4" style={{ background: t.card }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm" style={{ color: t.text }}>Activity</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: t.textMuted }}>
          <span>{totalActive} active days</span>
          {totalPerfect > 0 && <span style={{ color: rc.color }}>✦ {totalPerfect} perfect</span>}
        </div>
      </div>

      <div className="flex gap-0.5 overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-1">
            {week.map((day) => (
              <div
                key={day.date}
                className="rounded-sm"
                style={{ background: cellColor(day.habits), aspectRatio: '1', minHeight: '10px' }}
                title={`${day.date}: ${day.habits} habit${day.habits !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2.5 text-xs" style={{ color: t.textMuted }}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: t.border }} />
          <span>None</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: rc.color + '40' }} />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: rc.color + '80' }} />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: rc.color }} />
          <span>Perfect</span>
        </div>
      </div>
    </div>
  )
}
