import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import HunterCard from '../components/HunterCard'
import DailyQuests from '../components/DailyQuests'
import TaskList from '../components/TaskList'
import TodaysWins from '../components/TodaysWins'
import RankUpOverlay from '../components/RankUpOverlay'
import LevelUpToast from '../components/LevelUpToast'
import StreakMilestoneToast from '../components/StreakMilestoneToast'
import NamePrompt from '../components/NamePrompt'
import PerfectDayEffect from '../components/PerfectDayEffect'
import WeeklySummaryModal from '../components/WeeklySummaryModal'
import SettingsModal from '../components/SettingsModal'
import XpFloats from '../components/XpFloats'
import StreakCalendar from '../components/StreakCalendar'
import OnboardingTutorial from '../components/OnboardingTutorial'
import UndoToast from '../components/UndoToast'
import ComboToast from '../components/ComboToast'
import LuckyStrikeToast from '../components/LuckyStrikeToast'
import LoginBonusToast from '../components/LoginBonusToast'
import FreezeToast from '../components/FreezeToast'
import BossBattle from '../components/BossBattle'
import BossDefeatedToast from '../components/BossDefeatedToast'
import ComebackToast from '../components/ComebackToast'
import ClassSelectModal from '../components/ClassSelectModal'
import { useTheme } from '../lib/theme'
import { useStore } from '../store/useStore'

function PenaltyToast() {
  const penaltyEvent = useStore((s) => s.xpPenaltyEvent)
  const clearXpPenaltyEvent = useStore((s) => s.clearXpPenaltyEvent)

  if (!penaltyEvent) return null

  setTimeout(clearXpPenaltyEvent, 3000)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-xl text-sm font-semibold text-white"
      style={{ background: '#dc2626', whiteSpace: 'nowrap' }}
    >
      ⚠️ -{penaltyEvent} XP — missed habits yesterday
    </motion.div>
  )
}

function useMidnightReminder() {
  const notifyBeforeMidnight = useStore((s) => s.notifyBeforeMidnight)
  const quests = useStore((s) => s.quests)
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!notifyBeforeMidnight) { notifiedRef.current = false; return }

    function check() {
      if (notifiedRef.current) return
      const now = new Date()
      const midnight = new Date(); midnight.setHours(24, 0, 0, 0)
      const msLeft = midnight.getTime() - now.getTime()
      const incomplete = quests.filter((q) => !q.completed_today).length
      // Notify at 2h remaining if habits not done
      if (msLeft <= 7200000 && msLeft > 3540000 && incomplete > 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
          notifiedRef.current = true
          new Notification('⚠️ Habits incomplete!', {
            body: `${incomplete} habit${incomplete > 1 ? 's' : ''} left — ${Math.floor(msLeft / 3600000)}h until midnight.`,
            icon: '/favicon.ico',
          })
        }
      }
    }

    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [notifyBeforeMidnight, quests])
}

export default function Dashboard() {
  const t = useTheme()
  const darkMode = useStore((s) => s.darkMode)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)
  const classUnlockEvent = useStore((s) => s.classUnlockEvent)
  const clearClassUnlockEvent = useStore((s) => s.clearClassUnlockEvent)
  useMidnightReminder()

  return (
    <>
      <NamePrompt />
      <OnboardingTutorial />
      <RankUpOverlay />
      <LevelUpToast />
      <StreakMilestoneToast />
      <PerfectDayEffect />
      <WeeklySummaryModal />
      <PenaltyToast />
      <UndoToast />
      <ComboToast />
      <LuckyStrikeToast />
      <LoginBonusToast />
      <FreezeToast />
      <BossDefeatedToast />
      <ComebackToast />
      <ClassSelectModal open={classUnlockEvent} onClose={clearClassUnlockEvent} />
      <XpFloats />

      <div className="min-h-screen" style={{ background: t.bg }}>
        <div className="max-w-md mx-auto px-4 pt-8 pb-6 space-y-3">
          {/* Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="px-1 pb-2 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: t.textMuted }}>The System</p>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: t.buttonBg }}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode
                  ? <Sun size={15} style={{ color: '#f59e0b' }} />
                  : <Moon size={15} style={{ color: t.textSub }} />
                }
              </button>
              <SettingsModal />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <HunterCard />
          </motion.div>
          <BossBattle />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <DailyQuests />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <TaskList />
          </motion.div>
          <TodaysWins />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
            <StreakCalendar />
          </motion.div>
        </div>
      </div>
    </>
  )
}
