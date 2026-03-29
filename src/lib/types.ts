export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export type TaskDifficulty = 'poring' | 'orc' | 'drake' | 'mvp'

export interface UserProfile {
  id: string
  username: string
  hunter_rank: HunterRank
  level: number
  current_xp: number
  total_xp: number
  total_tasks_completed: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  difficulty: TaskDifficulty
  xp_value: number
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DailyQuest {
  id: string
  user_id: string
  quest_text: string
  current_streak: number
  last_completed_at: string | null
  created_at: string
  // Virtual: is it completed today?
  completed_today?: boolean
}

export interface DailyCompletion {
  id: string
  daily_quest_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export const XP_VALUES: Record<TaskDifficulty, number> = {
  poring: 10,
  orc: 50,
  drake: 200,
  mvp: 1000,
}

export const QUEST_XP = 30  // XP awarded per daily habit completion

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  poring: 'Poring',
  orc: 'Orc',
  drake: 'Drake',
  mvp: 'MVP',
}

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  poring: '#10b981',
  orc: '#3b82f6',
  drake: '#8b5cf6',
  mvp: '#f59e0b',
}

export const RANK_CONFIG: Record<HunterRank, { color: string; levels: [number, number]; title: string; identity: string; glow: string }> = {
  E: { color: '#9ca3af', levels: [1, 10],   title: 'Novice',         identity: "I'm building the foundation",  glow: 'rgba(156,163,175,0.6)' },
  D: { color: '#60a5fa', levels: [11, 20],  title: 'Acolyte',        identity: "I'm becoming consistent",      glow: 'rgba(96,165,250,0.6)'  },
  C: { color: '#34d399', levels: [21, 40],  title: 'Warrior',        identity: "I'm someone who shows up",     glow: 'rgba(52,211,153,0.6)'  },
  B: { color: '#a78bfa', levels: [41, 60],  title: 'Champion',       identity: "I'm reliable and disciplined", glow: 'rgba(167,139,250,0.6)' },
  A: { color: '#f97316', levels: [61, 80],  title: 'Berserker',      identity: "I'm elite at execution",       glow: 'rgba(249,115,22,0.6)'  },
  S: { color: '#f59e0b', levels: [81, 100], title: 'Shadow Monarch', identity: "I'm a systems master",         glow: 'rgba(245,158,11,0.6)'  },
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function getTotalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i)
  }
  return total
}

export function getRankForLevel(level: number): HunterRank {
  if (level <= 10) return 'E'
  if (level <= 20) return 'D'
  if (level <= 40) return 'C'
  if (level <= 60) return 'B'
  if (level <= 80) return 'A'
  return 'S'
}

export function getLevelProgress(level: number, currentXp: number): { current: number; needed: number; percent: number } {
  const needed = getXpForLevel(level)
  const percent = Math.min(100, Math.floor((currentXp / needed) * 100))
  return { current: currentXp, needed, percent }
}

export function getStreakMultiplier(maxStreak: number): number {
  if (maxStreak >= 14) return 1.5
  if (maxStreak >= 7) return 1.25
  if (maxStreak >= 3) return 1.1
  return 1.0
}

export const DAILY_CHALLENGE_XP = 75

export const DAILY_CHALLENGES = [
  'Drink 8 glasses of water',
  'Do 20 minutes of exercise',
  'Read for 15 minutes',
  'Meditate for 5 minutes',
  'Write 3 things you\'re grateful for',
  'Take a 10-minute walk outside',
  'Stretch for 10 minutes',
  'Plan tomorrow\'s top 3 priorities',
  'Call or message someone you care about',
  'Learn one new thing today',
  'No social media before noon',
  'Go to sleep before midnight',
  'Eat at least one healthy meal',
  'Do 10 push-ups',
  'Organize your workspace',
  'Review your goals for 5 minutes',
  'Take a cold shower',
  'Write in a journal',
  'Cook a meal at home',
  'Practice deep breathing for 5 minutes',
  'Do 20 minutes of focused work with no distractions',
  'Spend 10 minutes in sunlight',
  'Avoid processed food today',
  'Stand up and move every hour',
  'Write down one thing you\'re proud of',
]

export function getDailyChallenge(dateStr: string): string {
  const hash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length]
}

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task',   name: 'First Blood',     icon: '⚔️',  description: 'Complete your first task' },
  { id: 'first_habit',  name: 'Creature of Habit', icon: '🌱', description: 'Complete a daily habit' },
  { id: 'streak_3',     name: 'On Fire',          icon: '🔥',  description: '3-day habit streak' },
  { id: 'streak_7',     name: 'Week Warrior',     icon: '🗓️', description: '7-day habit streak' },
  { id: 'streak_30',    name: 'Iron Will',        icon: '💪',  description: '30-day habit streak' },
  { id: 'tasks_10',     name: 'Grinder',          icon: '⚙️', description: 'Complete 10 tasks' },
  { id: 'tasks_50',     name: 'Veteran',          icon: '🏅',  description: 'Complete 50 tasks' },
  { id: 'perfect_day',  name: 'Perfect Day',      icon: '✨',  description: 'Complete all habits in a day' },
  { id: 'multiplier',   name: 'In the Zone',      icon: '⚡',  description: 'Earn an XP multiplier' },
  { id: 'level_20',     name: 'Rising Hunter',    icon: '📈',  description: 'Reach level 20' },
  { id: 's_rank',       name: 'Shadow Monarch',   icon: '👑',  description: 'Reach S-Rank' },
]
