import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HunterRank } from '../lib/types'
import { XP_VALUES, getRankForLevel, getXpForLevel } from '../lib/types'

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

interface RankUpEvent {
  fromRank: HunterRank
  toRank: HunterRank
  level: number
}

interface XpGainEvent {
  id: number
  amount: number
  x: number
  y: number
}

let xpEventId = 0
function today() {
  return new Date().toISOString().split('T')[0]
}

interface SystemStore {
  profile: LocalProfile
  tasks: LocalTask[]
  quests: LocalQuest[]

  addTask: (title: string, difficulty: string) => void
  completeTask: (taskId: string, x: number, y: number) => void
  deleteTask: (taskId: string) => void

  completeQuest: (questId: string) => void
  addQuest: (text: string) => void
  deleteQuest: (questId: string) => void

  rankUpEvent: RankUpEvent | null
  clearRankUpEvent: () => void

  xpGainEvents: XpGainEvent[]

  isPerfectDay: boolean
}

const DEFAULT_PROFILE: LocalProfile = {
  username: 'Hunter',
  hunter_rank: 'E',
  level: 1,
  current_xp: 0,
  total_xp: 0,
  total_tasks_completed: 0,
}

export const useStore = create<SystemStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      tasks: [],
      quests: [],
      rankUpEvent: null,
      xpGainEvents: [],
      isPerfectDay: false,

      addTask: (title, difficulty) => {
        const task: LocalTask = {
          id: crypto.randomUUID(),
          title,
          difficulty,
          xp_value: XP_VALUES[difficulty as keyof typeof XP_VALUES],
          created_at: new Date().toISOString(),
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
      },

      completeTask: (taskId, x, y) => {
        const { tasks, profile, isPerfectDay } = get()
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        const xpGained = isPerfectDay ? task.xp_value * 2 : task.xp_value
        const eventId = xpEventId++

        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== taskId),
          xpGainEvents: [...s.xpGainEvents, { id: eventId, amount: xpGained, x, y }],
        }))

        setTimeout(() => {
          set((s) => ({ xpGainEvents: s.xpGainEvents.filter((e) => e.id !== eventId) }))
        }, 1600)

        // Level up logic
        const oldRank = profile.hunter_rank
        let newXp = profile.current_xp + xpGained
        let newLevel = profile.level
        let newTotalXp = profile.total_xp + xpGained

        while (newXp >= getXpForLevel(newLevel) && newLevel < 100) {
          newXp -= getXpForLevel(newLevel)
          newLevel++
        }

        const newRank = getRankForLevel(newLevel)

        set({
          profile: {
            ...profile,
            current_xp: newXp,
            total_xp: newTotalXp,
            level: newLevel,
            hunter_rank: newRank,
            total_tasks_completed: profile.total_tasks_completed + 1,
          },
        })

        if (newRank !== oldRank) {
          set({ rankUpEvent: { fromRank: oldRank as HunterRank, toRank: newRank, level: newLevel } })
        }
      },

      deleteTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),

      addQuest: (text) => {
        if (get().quests.length >= 3) return
        const quest: LocalQuest = {
          id: crypto.randomUUID(),
          quest_text: text,
          current_streak: 0,
          last_completed_at: null,
          completed_today: false,
        }
        set((s) => ({ quests: [...s.quests, quest] }))
      },

      completeQuest: (questId) => {
        const { quests } = get()
        const quest = quests.find((q) => q.id === questId)
        if (!quest || quest.completed_today) return

        const todayStr = today()
        let newStreak = 1
        if (quest.last_completed_at) {
          const diffDays = Math.floor(
            (new Date(todayStr).getTime() - new Date(quest.last_completed_at).getTime()) / 86400000
          )
          newStreak = diffDays === 1 ? quest.current_streak + 1 : 1
        }

        const updated = quests.map((q) =>
          q.id === questId
            ? { ...q, completed_today: true, current_streak: newStreak, last_completed_at: todayStr }
            : q
        )

        const isPerfectDay = updated.length === 3 && updated.every((q) => q.completed_today)
        set({ quests: updated, isPerfectDay })
      },

      deleteQuest: (questId) =>
        set((s) => ({
          quests: s.quests.filter((q) => q.id !== questId),
          isPerfectDay: false,
        })),

      clearRankUpEvent: () => set({ rankUpEvent: null }),
    }),
    {
      name: 'the-system',
      // Reset completed_today on new day
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const todayStr = today()
        const resetQuests = state.quests.map((q) => {
          if (q.last_completed_at === todayStr) return q
          // Also break streak if missed 2+ days
          if (q.last_completed_at) {
            const diffDays = Math.floor(
              (new Date(todayStr).getTime() - new Date(q.last_completed_at).getTime()) / 86400000
            )
            if (diffDays >= 2) return { ...q, completed_today: false, current_streak: 0 }
          }
          return { ...q, completed_today: false }
        })
        state.quests = resetQuests
        state.isPerfectDay = resetQuests.length === 3 && resetQuests.every((q) => q.completed_today)
      },
    }
  )
)
