import { useStore } from '../store/useStore'
import { useTheme } from '../lib/theme'

const WEEKS = 13
// GitHub-style greens
const GREEN = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
const MISSED = '#7f1d1d'  // deep red for missed days

export default function StreakCalendar() {
  const dailyActivity = useStore((s) => s.dailyActivity)
  const t = useTheme()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalDays = WEEKS * 7
  const days: Array<{ date: string; habits: number; missed: boolean }> = []

  // Determine the earliest date we have any activity for context
  const activityDates = Object.keys(dailyActivity).sort()
  const firstActivityDate = activityDates[0] ?? null

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const habits = dailyActivity[dateStr]?.habits ?? 0
    // "Missed" = day is in the past, user had started tracking (first activity exists),
    // and no habits were completed that day
    const isPast = i > 0  // not today
    const afterStart = firstActivityDate !== null && dateStr >= firstActivityDate
    const missed = isPast && afterStart && habits === 0
    days.push({ date: dateStr, habits, missed })
  }

  const weeks: Array<typeof days> = []
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7))
  }

  const totalActive = days.filter((d) => d.habits > 0).length
  const totalPerfect = days.filter((d) => d.habits >= 3).length

  function cellColor(day: { habits: number; missed: boolean; date: string }): string {
    const isToday = day.date === today.toISOString().split('T')[0]
    if (day.habits === 0) {
      if (day.missed) return MISSED
      return t.darkMode ? '#161b22' : '#ebedf0'  // empty but not missed
    }
    if (day.habits === 1) return GREEN[2]
    if (day.habits === 2) return GREEN[3]
    if (day.habits >= 3) return GREEN[4]
    return isToday ? GREEN[1] : GREEN[0]
  }

  return (
    <div className="rounded-2xl shadow-sm px-5 py-4" style={{ background: t.card }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm" style={{ color: t.text }}>Activity</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: t.textMuted }}>
          <span>{totalActive} active days</span>
          {totalPerfect > 0 && <span style={{ color: '#39d353' }}>✦ {totalPerfect} perfect</span>}
        </div>
      </div>

      <div className="flex gap-0.5 overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-1">
            {week.map((day) => (
              <div
                key={day.date}
                className="rounded-sm"
                style={{ background: cellColor(day), aspectRatio: '1', minHeight: '10px' }}
                title={`${day.date}: ${day.habits} habit${day.habits !== 1 ? 's' : ''}${day.missed ? ' (missed)' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2.5 text-xs" style={{ color: t.textMuted }}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: MISSED }} />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN[2] }} />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN[3] }} />
          <span>2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN[4] }} />
          <span>3+</span>
        </div>
      </div>
    </div>
  )
}
