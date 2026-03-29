import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HunterRank } from '../lib/types'
import {
  XP_VALUES, QUEST_XP, DAILY_CHALLENGE_XP,
  getRankForLevel, getXpForLevel, getDailyChallenge, getStreakMultiplier,
} from '../lib/types'
import { sounds } from '../lib/sounds'

export interface LocalProfile {
  username: string
  hunter_rank: HunterRank
  level: number
  current_xp: number
  total_xp: number
  total_tasks_completed: number
}

export interface LocalTask {
  id: string
  title: string
  difficulty: string
  xp_value: number
  created_at: string
}

export interface LocalQuest {
  id: string
  quest_text: string
  current_streak: number
  last_completed_at: string | null
  completed_today: boolean
}

export interface CompletedTask {
  id: string
  title: string
  difficulty: string
  xp_value: number
  xp_earned: number
  completed_at: string
}

export interface DailyActivity {
  habits: number
  tasks: number
}

export interface ProfileSlot {
  id: string
  profile: LocalProfile
  tasks: LocalTask[]
  quests: LocalQuest[]
  isPerfectDay: boolean
  dailyActivity: Record<string, DailyActivity>
}

export interface WeeklyStats {
  weekStart: string
  xpEarned: number
  habitsCompleted: number
  tasksCompleted: number
}

interface RankUpEvent { fromRank: HunterRank; toRank: HunterRank; level: number }
interface XpGainEvent { id: number; amount: number; x: number; y: number }

const STREAK_MILESTONES = [7, 14, 30, 60, 100]
let xpEventId = 0

function today() { return new Date().toISOString().split('T')[0] }

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

function haptic(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

function applyXp(profile: LocalProfile, xpGained: number) {
  const oldRank = profile.hunter_rank
  let newXp = profile.current_xp + xpGained
  let newLevel = profile.level
  const newTotalXp = profile.total_xp + xpGained
  while (newXp >= getXpForLevel(newLevel) && newLevel < 100) {
    newXp -= getXpForLevel(newLevel)
    newLevel++
  }
  const newRank = getRankForLevel(newLevel)
  return {
    newProfile: { ...profile, current_xp: newXp, total_xp: newTotalXp, level: newLevel, hunter_rank: newRank },
    leveledUp: newLevel > profile.level,
    rankedUp: newRank !== oldRank,
  }
}

function updateActivity(
  dailyActivity: Record<string, DailyActivity>,
  field: 'habits' | 'tasks'
): Record<string, DailyActivity> {
  const todayStr = today()
  const prev = dailyActivity[todayStr] || { habits: 0, tasks: 0 }
  return { ...dailyActivity, [todayStr]: { ...prev, [field]: prev[field] + 1 } }
}

const DEFAULT_PROFILE: LocalProfile = {
  username: 'Hunter', hunter_rank: 'E', level: 1,
  current_xp: 0, total_xp: 0, total_tasks_completed: 0,
}

const DEFAULT_WEEKLY: WeeklyStats = {
  weekStart: getWeekStart(), xpEarned: 0, habitsCompleted: 0, tasksCompleted: 0,
}

interface SystemStore {
  // Core per-profile state
  profile: LocalProfile
  tasks: LocalTask[]
  quests: LocalQuest[]
  isPerfectDay: boolean
  todaysWins: CompletedTask[]
  weeklyStats: WeeklyStats
  lastWeekStats: WeeklyStats | null
  dailyActivity: Record<string, DailyActivity>

  // Multi-profile
  profileSlots: ProfileSlot[]
  activeSlotId: string

  // Global settings (not per-profile)
  hasOnboarded: boolean
  tutorialDone: boolean
  darkMode: boolean
  xpPenaltyEnabled: boolean

  // Daily challenge (global — same challenge for all profiles each day)
  dailyChallenge: { text: string; completed: boolean; date: string } | null

  // Events
  rankUpEvent: RankUpEvent | null
  levelUpEvent: number | null
  streakMilestoneEvent: number | null
  perfectDayEvent: boolean
  weekSummaryEvent: boolean
  xpGainEvents: XpGainEvent[]
  xpPenaltyEvent: number | null

  // Actions
  updateUsername: (name: string) => void
  setHasOnboarded: (v: boolean) => void
  setTutorialDone: () => void
  resetProgress: () => void
  toggleDarkMode: () => void
  toggleXpPenalty: () => void

  addTask: (title: string, difficulty: string) => void
  completeTask: (taskId: string, x: number, y: number) => void
  deleteTask: (taskId: string) => void

  completeQuest: (questId: string, x: number, y: number) => void
  addQuest: (text: string) => void
  deleteQuest: (questId: string) => void
  reorderQuests: (newOrder: LocalQuest[]) => void
  updateQuestText: (questId: string, newText: string) => void

  completeDailyChallenge: (x: number, y: number) => void

  switchProfile: (slotId: string) => void
  createProfile: (name: string) => void
  deleteProfile: (slotId: string) => void

  clearRankUpEvent: () => void
  clearLevelUpEvent: () => void
  clearStreakMilestoneEvent: () => void
  clearPerfectDayEvent: () => void
  clearWeekSummaryEvent: () => void
  clearXpPenaltyEvent: () => void
}

export const useStore = create<SystemStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      tasks: [],
      quests: [],
      hasOnboarded: false,
      tutorialDone: false,
      darkMode: false,
      xpPenaltyEnabled: false,
      todaysWins: [],
      weeklyStats: DEFAULT_WEEKLY,
      lastWeekStats: null,
      profileSlots: [],
      activeSlotId: 'default',
      isPerfectDay: false,
      dailyActivity: {},
      dailyChallenge: null,
      rankUpEvent: null,
      levelUpEvent: null,
      streakMilestoneEvent: null,
      perfectDayEvent: false,
      weekSummaryEvent: false,
      xpGainEvents: [],
      xpPenaltyEvent: null,

      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setTutorialDone: () => set({ tutorialDone: true }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleXpPenalty: () => set((s) => ({ xpPenaltyEnabled: !s.xpPenaltyEnabled })),

      updateUsername: (name) =>
        set((s) => ({ profile: { ...s.profile, username: name } })),

      resetProgress: () => {
        const { activeSlotId } = get()
        const fresh: LocalProfile = { ...DEFAULT_PROFILE }
        set((s) => ({
          profile: fresh,
          tasks: [],
          quests: [],
          isPerfectDay: false,
          todaysWins: [],
          dailyActivity: {},
          weeklyStats: { ...DEFAULT_WEEKLY, weekStart: getWeekStart() },
          profileSlots: s.profileSlots.map(slot =>
            slot.id === activeSlotId
              ? { ...slot, profile: fresh, tasks: [], quests: [], isPerfectDay: false, dailyActivity: {} }
              : slot
          ),
        }))
      },

      addTask: (title, difficulty) => {
        const task: LocalTask = {
          id: crypto.randomUUID(), title, difficulty,
          xp_value: XP_VALUES[difficulty as keyof typeof XP_VALUES],
          created_at: new Date().toISOString(),
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
      },

      completeTask: (taskId, x, y) => {
        const { tasks, profile, quests, isPerfectDay, dailyActivity } = get()
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        const maxStreak = quests.length > 0 ? Math.max(...quests.map(q => q.current_streak)) : 0
        const multiplier = getStreakMultiplier(maxStreak)
        const baseXp = isPerfectDay ? task.xp_value * 2 : task.xp_value
        const xpGained = Math.round(baseXp * multiplier)
        const eventId = xpEventId++
        haptic([10, 50, 10])
        sounds.taskComplete()

        const completedEntry: CompletedTask = {
          id: task.id, title: task.title, difficulty: task.difficulty,
          xp_value: task.xp_value, xp_earned: xpGained,
          completed_at: new Date().toISOString(),
        }

        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== taskId),
          todaysWins: [completedEntry, ...s.todaysWins],
          dailyActivity: updateActivity(dailyActivity, 'tasks'),
          weeklyStats: {
            ...s.weeklyStats,
            xpEarned: s.weeklyStats.xpEarned + xpGained,
            tasksCompleted: s.weeklyStats.tasksCompleted + 1,
          },
          xpGainEvents: [...s.xpGainEvents, { id: eventId, amount: xpGained, x, y }],
        }))
        setTimeout(() => set((s) => ({ xpGainEvents: s.xpGainEvents.filter((e) => e.id !== eventId) })), 1600)

        const { newProfile, leveledUp, rankedUp } = applyXp(
          { ...profile, total_tasks_completed: profile.total_tasks_completed + 1 },
          xpGained
        )
        set({ profile: newProfile })

        if (rankedUp) {
          sounds.rankUp()
          haptic([50, 30, 50, 30, 100])
          set({ rankUpEvent: { fromRank: profile.hunter_rank, toRank: newProfile.hunter_rank, level: newProfile.level } })
        } else if (leveledUp) {
          sounds.levelUp()
          haptic([50, 30, 50, 30, 100])
          set({ levelUpEvent: newProfile.level })
        }
      },

      deleteTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),

      addQuest: (text) => {
        if (get().quests.length >= 3) return
        set((s) => ({
          quests: [...s.quests, {
            id: crypto.randomUUID(), quest_text: text,
            current_streak: 0, last_completed_at: null, completed_today: false,
          }],
        }))
      },

      completeQuest: (questId, x, y) => {
        const { quests, profile, isPerfectDay, dailyActivity } = get()
        const quest = quests.find((q) => q.id === questId)
        if (!quest || quest.completed_today) return

        haptic(10)
        sounds.habitComplete()

        const maxStreak = Math.max(...quests.map(q => q.current_streak))
        const multiplier = getStreakMultiplier(maxStreak)
        const baseXp = isPerfectDay ? QUEST_XP * 2 : QUEST_XP
        const xpGained = Math.round(baseXp * multiplier)

        const todayStr = today()
        let newStreak = 1
        if (quest.last_completed_at) {
          const diff = Math.floor(
            (new Date(todayStr).getTime() - new Date(quest.last_completed_at).getTime()) / 86400000
          )
          newStreak = diff === 1 ? quest.current_streak + 1 : 1
        }

        const updated = quests.map((q) =>
          q.id === questId
            ? { ...q, completed_today: true, current_streak: newStreak, last_completed_at: todayStr }
            : q
        )
        const wasPerfect = isPerfectDay
        const newIsPerfectDay = updated.length === 3 && updated.every((q) => q.completed_today)
        const eventId = xpEventId++

        set((s) => ({
          quests: updated,
          isPerfectDay: newIsPerfectDay,
          perfectDayEvent: !wasPerfect && newIsPerfectDay,
          dailyActivity: updateActivity(dailyActivity, 'habits'),
          weeklyStats: {
            ...s.weeklyStats,
            xpEarned: s.weeklyStats.xpEarned + xpGained,
            habitsCompleted: s.weeklyStats.habitsCompleted + 1,
          },
          xpGainEvents: [...s.xpGainEvents, { id: eventId, amount: xpGained, x, y }],
        }))
        setTimeout(() => set((s) => ({ xpGainEvents: s.xpGainEvents.filter((e) => e.id !== eventId) })), 1600)

        const { newProfile, leveledUp, rankedUp } = applyXp(profile, xpGained)
        set({ profile: newProfile })

        if (rankedUp) {
          sounds.rankUp()
          haptic([50, 30, 50, 30, 100])
          set({ rankUpEvent: { fromRank: profile.hunter_rank, toRank: newProfile.hunter_rank, level: newProfile.level } })
        } else if (leveledUp) {
          sounds.levelUp()
          haptic([50, 30, 50, 30, 100])
          set({ levelUpEvent: newProfile.level })
        }

        if (STREAK_MILESTONES.includes(newStreak)) {
          set({ streakMilestoneEvent: newStreak })
        }
      },

      deleteQuest: (questId) =>
        set((s) => ({ quests: s.quests.filter((q) => q.id !== questId), isPerfectDay: false })),

      reorderQuests: (newOrder) => set({ quests: newOrder }),

      updateQuestText: (questId, newText) =>
        set((s) => ({
          quests: s.quests.map((q) => q.id === questId ? { ...q, quest_text: newText } : q),
        })),

      completeDailyChallenge: (x, y) => {
        const { dailyChallenge, profile, quests, isPerfectDay, dailyActivity } = get()
        if (!dailyChallenge || dailyChallenge.completed) return

        haptic([10, 50, 10])
        sounds.taskComplete()

        const maxStreak = quests.length > 0 ? Math.max(...quests.map(q => q.current_streak)) : 0
        const multiplier = getStreakMultiplier(maxStreak)
        const baseXp = isPerfectDay ? DAILY_CHALLENGE_XP * 2 : DAILY_CHALLENGE_XP
        const xpGained = Math.round(baseXp * multiplier)
        const eventId = xpEventId++

        set((s) => ({
          dailyChallenge: { ...s.dailyChallenge!, completed: true },
          dailyActivity: updateActivity(dailyActivity, 'tasks'),
          weeklyStats: {
            ...s.weeklyStats,
            xpEarned: s.weeklyStats.xpEarned + xpGained,
            tasksCompleted: s.weeklyStats.tasksCompleted + 1,
          },
          xpGainEvents: [...s.xpGainEvents, { id: eventId, amount: xpGained, x, y }],
        }))
        setTimeout(() => set((s) => ({ xpGainEvents: s.xpGainEvents.filter((e) => e.id !== eventId) })), 1600)

        const { newProfile, leveledUp, rankedUp } = applyXp(profile, xpGained)
        set({ profile: newProfile })

        if (rankedUp) {
          sounds.rankUp()
          haptic([50, 30, 50, 30, 100])
          set({ rankUpEvent: { fromRank: profile.hunter_rank, toRank: newProfile.hunter_rank, level: newProfile.level } })
        } else if (leveledUp) {
          sounds.levelUp()
          haptic([50, 30, 50, 30, 100])
          set({ levelUpEvent: newProfile.level })
        }
      },

      switchProfile: (slotId) => {
        const { profile, tasks, quests, isPerfectDay, dailyActivity, profileSlots, activeSlotId } = get()
        const updatedSlots = profileSlots.map(slot =>
          slot.id === activeSlotId
            ? { ...slot, profile, tasks, quests, isPerfectDay, dailyActivity }
            : slot
        )
        const newSlot = updatedSlots.find(s => s.id === slotId)
        if (!newSlot) return
        set({
          profileSlots: updatedSlots,
          activeSlotId: slotId,
          profile: newSlot.profile,
          tasks: newSlot.tasks,
          quests: newSlot.quests,
          isPerfectDay: newSlot.isPerfectDay,
          dailyActivity: newSlot.dailyActivity || {},
          todaysWins: [],
        })
      },

      createProfile: (name) => {
        const { profile, tasks, quests, isPerfectDay, dailyActivity, profileSlots, activeSlotId } = get()
        if (profileSlots.length >= 3) return
        const newId = crypto.randomUUID()
        const newProfile: LocalProfile = { ...DEFAULT_PROFILE, username: name }
        const updatedSlots = [
          ...profileSlots.map(slot =>
            slot.id === activeSlotId
              ? { ...slot, profile, tasks, quests, isPerfectDay, dailyActivity }
              : slot
          ),
          { id: newId, profile: newProfile, tasks: [], quests: [], isPerfectDay: false, dailyActivity: {} },
        ]
        set({
          profileSlots: updatedSlots,
          activeSlotId: newId,
          profile: newProfile,
          tasks: [],
          quests: [],
          isPerfectDay: false,
          dailyActivity: {},
          todaysWins: [],
        })
      },

      deleteProfile: (slotId) => {
        const { profileSlots, activeSlotId } = get()
        if (profileSlots.length <= 1) return
        const remaining = profileSlots.filter(s => s.id !== slotId)
        if (activeSlotId === slotId) {
          const next = remaining[0]
          set({
            profileSlots: remaining,
            activeSlotId: next.id,
            profile: next.profile,
            tasks: next.tasks,
            quests: next.quests,
            isPerfectDay: next.isPerfectDay,
            dailyActivity: next.dailyActivity || {},
          })
        } else {
          set({ profileSlots: remaining })
        }
      },

      clearRankUpEvent: () => set({ rankUpEvent: null }),
      clearLevelUpEvent: () => set({ levelUpEvent: null }),
      clearStreakMilestoneEvent: () => set({ streakMilestoneEvent: null }),
      clearPerfectDayEvent: () => set({ perfectDayEvent: false }),
      clearWeekSummaryEvent: () => set({ weekSummaryEvent: false }),
      clearXpPenaltyEvent: () => set({ xpPenaltyEvent: null }),
    }),
    {
      name: 'the-system',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const todayStr = today()
        const weekStart = getWeekStart()

        // Reset quests daily
        state.quests = (state.quests || []).map((q) => {
          if (q.last_completed_at === todayStr) return q
          if (q.last_completed_at) {
            const diff = Math.floor(
              (new Date(todayStr).getTime() - new Date(q.last_completed_at).getTime()) / 86400000
            )
            if (diff >= 2) return { ...q, completed_today: false, current_streak: 0 }
          }
          return { ...q, completed_today: false }
        })
        state.isPerfectDay = state.quests.length === 3 && state.quests.every((q) => q.completed_today)

        // Clear today's wins if it's a new day
        state.todaysWins = (state.todaysWins || []).filter(t => t.completed_at.startsWith(todayStr))

        // Weekly stats
        if (!state.weeklyStats || state.weeklyStats.weekStart !== weekStart) {
          const old = state.weeklyStats
          state.lastWeekStats = old || null
          state.weeklyStats = { weekStart, xpEarned: 0, habitsCompleted: 0, tasksCompleted: 0 }
          if (old && (old.xpEarned > 0 || old.habitsCompleted > 0 || old.tasksCompleted > 0)) {
            state.weekSummaryEvent = true
          }
        }

        // Daily challenge — reset each day
        if (!state.dailyChallenge || state.dailyChallenge.date !== todayStr) {
          state.dailyChallenge = { text: getDailyChallenge(todayStr), completed: false, date: todayStr }
        }

        // XP penalty — if enabled and user missed habits yesterday
        if (state.xpPenaltyEnabled) {
          const yesterday = new Date(todayStr)
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          const activity = state.dailyActivity || {}
          const hasHistory = Object.keys(activity).some(d => d < todayStr)
          if (hasHistory) {
            const yday = activity[yesterdayStr]
            if (!yday || yday.habits === 0) {
              const penalty = Math.min(50, Math.floor(getXpForLevel(state.profile.level) * 0.05))
              if (penalty > 0) {
                state.profile.current_xp = Math.max(0, state.profile.current_xp - penalty)
                state.xpPenaltyEvent = penalty
              }
            }
          }
        }

        // Initialize profile slots for existing users
        if (!state.profileSlots || state.profileSlots.length === 0) {
          const slotId = 'default'
          state.profileSlots = [{
            id: slotId,
            profile: state.profile,
            tasks: state.tasks,
            quests: state.quests,
            isPerfectDay: state.isPerfectDay,
            dailyActivity: state.dailyActivity || {},
          }]
          state.activeSlotId = slotId
        }

        // Migrate existing slots to include dailyActivity if missing
        state.profileSlots = state.profileSlots.map(slot => ({
          ...slot,
          dailyActivity: slot.dailyActivity || {},
        }))

        // Init new fields for existing users
        if (state.dailyActivity === undefined) state.dailyActivity = {}
        if (state.tutorialDone === undefined) state.tutorialDone = true // don't show tutorial to existing users
        if (state.darkMode === undefined) state.darkMode = false
        if (state.xpPenaltyEnabled === undefined) state.xpPenaltyEnabled = false
      },
    }
  )
)
