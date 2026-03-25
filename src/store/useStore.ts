import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { UserProfile, Task, DailyQuest, HunterRank } from '../lib/types'
import { XP_VALUES, getRankForLevel, getXpForLevel, RANK_CONFIG } from '../lib/types'

interface RankUpEvent {
  fromRank: HunterRank
  toRank: HunterRank
  level: number
  identity: string
}

interface XpGainEvent {
  amount: number
  x: number
  y: number
}

interface SystemStore {
  // Auth
  userId: string | null
  setUserId: (id: string | null) => void

  // Profile
  profile: UserProfile | null
  setProfile: (p: UserProfile | null) => void
  fetchProfile: () => Promise<void>

  // Tasks
  tasks: Task[]
  fetchTasks: () => Promise<void>
  addTask: (title: string, difficulty: Task['difficulty']) => Promise<void>
  completeTask: (taskId: string, x: number, y: number) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>

  // Daily Quests
  dailyQuests: DailyQuest[]
  fetchDailyQuests: () => Promise<void>
  addDailyQuest: (text: string) => Promise<void>
  completeDailyQuest: (questId: string) => Promise<void>
  deleteDailyQuest: (questId: string) => Promise<void>

  // UI events
  rankUpEvent: RankUpEvent | null
  clearRankUpEvent: () => void
  xpGainEvents: XpGainEvent[]
  addXpGainEvent: (amount: number, x: number, y: number) => void
  clearXpGainEvent: (idx: number) => void

  // Perfect day
  isPerfectDay: boolean
  checkPerfectDay: () => void
}

export const useStore = create<SystemStore>((set, get) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  profile: null,
  setProfile: (p) => set({ profile: p }),

  fetchProfile: async () => {
    const { userId } = get()
    if (!userId) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ profile: data as UserProfile })
  },

  tasks: [],
  fetchTasks: async () => {
    const { userId } = get()
    if (!userId) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
    if (data) set({ tasks: data as Task[] })
  },

  addTask: async (title, difficulty) => {
    const { userId } = get()
    if (!userId) return
    const xp_value = XP_VALUES[difficulty]
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: userId, title, difficulty, xp_value, completed: false })
      .select()
      .single()
    if (data) {
      set((s) => ({ tasks: [data as Task, ...s.tasks] }))
    }
  },

  completeTask: async (taskId, x, y) => {
    const { userId, profile, isPerfectDay } = get()
    if (!userId || !profile) return

    // Mark task complete
    await supabase
      .from('tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId)

    // Remove from list
    const task = get().tasks.find((t) => t.id === taskId)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }))
    if (!task) return

    const xpGained = isPerfectDay ? task.xp_value * 2 : task.xp_value
    get().addXpGainEvent(xpGained, x, y)

    // Update profile XP
    let newXp = profile.current_xp + xpGained
    let newLevel = profile.level
    let newTotalXp = profile.total_xp + xpGained
    const oldRank = profile.hunter_rank as HunterRank

    // Level up loop
    while (newXp >= getXpForLevel(newLevel) && newLevel < 100) {
      newXp -= getXpForLevel(newLevel)
      newLevel++
    }

    const newRank = getRankForLevel(newLevel)
    const updatedProfile: Partial<UserProfile> = {
      current_xp: newXp,
      total_xp: newTotalXp,
      level: newLevel,
      hunter_rank: newRank,
      total_tasks_completed: profile.total_tasks_completed + 1,
    }

    await supabase
      .from('user_profiles')
      .update(updatedProfile)
      .eq('id', userId)

    set({ profile: { ...profile, ...updatedProfile } as UserProfile })

    // Check rank up
    if (newRank !== oldRank) {
      set({
        rankUpEvent: {
          fromRank: oldRank,
          toRank: newRank,
          level: newLevel,
          identity: RANK_CONFIG[newRank].identity,
        },
      })
    }
  },

  deleteTask: async (taskId) => {
    const { userId } = get()
    if (!userId) return
    await supabase.from('tasks').delete().eq('id', taskId)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }))
  },

  dailyQuests: [],
  fetchDailyQuests: async () => {
    const { userId } = get()
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]

    const { data: quests } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (!quests) return

    const { data: completions } = await supabase
      .from('daily_completions')
      .select('daily_quest_id')
      .eq('user_id', userId)
      .eq('completed_date', today)

    const completedIds = new Set(completions?.map((c) => c.daily_quest_id) || [])

    const questsWithStatus = quests.map((q) => ({
      ...q,
      completed_today: completedIds.has(q.id),
    })) as DailyQuest[]

    // Check for broken streaks (missed 2+ days)
    const updatedQuests = await Promise.all(
      questsWithStatus.map(async (q) => {
        if (!q.last_completed_at) return q
        const last = new Date(q.last_completed_at)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / 86400000)
        if (diffDays >= 2 && q.current_streak > 0) {
          await supabase
            .from('daily_quests')
            .update({ current_streak: 0 })
            .eq('id', q.id)
          return { ...q, current_streak: 0 }
        }
        return q
      })
    )

    set({ dailyQuests: updatedQuests })
    get().checkPerfectDay()
  },

  addDailyQuest: async (text) => {
    const { userId, dailyQuests } = get()
    if (!userId || dailyQuests.length >= 3) return
    const { data } = await supabase
      .from('daily_quests')
      .insert({ user_id: userId, quest_text: text, current_streak: 0 })
      .select()
      .single()
    if (data) {
      set((s) => ({ dailyQuests: [...s.dailyQuests, { ...data, completed_today: false } as DailyQuest] }))
    }
  },

  completeDailyQuest: async (questId) => {
    const { userId, dailyQuests, profile } = get()
    if (!userId || !profile) return

    const today = new Date().toISOString().split('T')[0]
    const quest = dailyQuests.find((q) => q.id === questId)
    if (!quest || quest.completed_today) return

    // Insert completion
    await supabase.from('daily_completions').insert({
      daily_quest_id: questId,
      user_id: userId,
      completed_date: today,
    })

    // Update streak
    let newStreak = quest.current_streak
    if (quest.last_completed_at) {
      const last = new Date(quest.last_completed_at)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / 86400000)
      if (diffDays === 1) {
        newStreak += 1
      } else if (diffDays === 0) {
        // already completed today
        return
      } else {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await supabase
      .from('daily_quests')
      .update({ current_streak: newStreak, last_completed_at: today })
      .eq('id', questId)

    set((s) => ({
      dailyQuests: s.dailyQuests.map((q) =>
        q.id === questId
          ? { ...q, completed_today: true, current_streak: newStreak, last_completed_at: today }
          : q
      ),
    }))

    get().checkPerfectDay()
  },

  deleteDailyQuest: async (questId) => {
    const { userId } = get()
    if (!userId) return
    await supabase.from('daily_quests').delete().eq('id', questId)
    set((s) => ({ dailyQuests: s.dailyQuests.filter((q) => q.id !== questId) }))
  },

  rankUpEvent: null,
  clearRankUpEvent: () => set({ rankUpEvent: null }),

  xpGainEvents: [],
  addXpGainEvent: (amount, x, y) => {
    set((s) => ({ xpGainEvents: [...s.xpGainEvents, { amount, x, y }] }))
    setTimeout(() => {
      set((s) => ({ xpGainEvents: s.xpGainEvents.slice(1) }))
    }, 1600)
  },
  clearXpGainEvent: (idx) =>
    set((s) => ({ xpGainEvents: s.xpGainEvents.filter((_, i) => i !== idx) })),

  isPerfectDay: false,
  checkPerfectDay: () => {
    const { dailyQuests } = get()
    if (dailyQuests.length === 3 && dailyQuests.every((q) => q.completed_today)) {
      set({ isPerfectDay: true })
    } else {
      set({ isPerfectDay: false })
    }
  },
}))
