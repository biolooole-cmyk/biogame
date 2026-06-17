export type UserRole = 'student' | 'teacher'

export type Grade = 7 | 8 | 9

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Student {
  id: string
  user_id: string
  grade: Grade
  class_id?: string
  xp_total: number
  rank: Rank
  streak_days: number
  missions_completed: number
  created_at: string
  user?: User
}

export interface Teacher {
  id: string
  user_id: string
  school?: string
  bio?: string
  created_at: string
  user?: User
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: Grade
  code: string
  student_count?: number
  created_at: string
}

export type MissionCategory = 'mystery' | 'investigation' | 'rescue' | 'lab' | 'crisis'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface Mission {
  id: string
  title: string
  description: string
  storyline: string
  grade: Grade
  category: MissionCategory
  difficulty: DifficultyLevel
  xp_reward: number
  estimated_minutes: number
  cover_image?: string
  tags: string[]
  is_published: boolean
  created_by: string
  created_at: string
  steps?: MissionStep[]
}

export type StepType = 'story' | 'evidence' | 'investigation' | 'question' | 'conclusion'

export interface MissionStep {
  id: string
  mission_id: string
  step_number: number
  type: StepType
  title: string
  content: string
  media_url?: string
  media_type?: 'image' | 'video' | 'chart'
  order_index: number
}

export interface Evidence {
  id: string
  mission_id: string
  title: string
  description: string
  type: 'image' | 'data' | 'text' | 'chart'
  content: string
  media_url?: string
  is_key_evidence: boolean
}

export interface Question {
  id: string
  mission_id: string
  step_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'open_ended' | 'hypothesis'
  options?: string[]
  correct_option?: number
  hint?: string
  order_index: number
}

export type Rank =
  | 'Young Naturalist'
  | 'Researcher'
  | 'Biologist'
  | 'Ecologist'
  | 'Geneticist'
  | 'Professor'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp_required?: number
  condition_type: string
  condition_value: number
}

export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface MissionProgress {
  id: string
  student_id: string
  mission_id: string
  status: MissionStatus
  current_step: number
  score?: number
  hypothesis?: string
  conclusion?: string
  notes?: string
  started_at: string
  completed_at?: string
  mission?: Mission
}

export interface NotebookEntry {
  id: string
  student_id: string
  mission_id: string
  title: string
  content: string
  entry_type: 'hypothesis' | 'observation' | 'note' | 'conclusion'
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  student_id: string
  question_id: string
  mission_id: string
  answer_text: string
  selected_option?: number
  is_correct?: boolean
  score?: number
  feedback?: string
  created_at: string
}

export interface XPEvent {
  id: string
  student_id: string
  amount: number
  reason: string
  mission_id?: string
  created_at: string
}

export interface DashboardStats {
  missionsCompleted: number
  totalXP: number
  currentRank: Rank
  nextRank: Rank | null
  xpToNextRank: number
  streakDays: number
  achievements: StudentAchievement[]
  recentMissions: MissionProgress[]
}

export const RANKS: { rank: Rank; minXP: number; color: string; icon: string }[] = [
  { rank: 'Young Naturalist', minXP: 0, color: '#22c55e', icon: '🌱' },
  { rank: 'Researcher', minXP: 500, color: '#3b82f6', icon: '🔬' },
  { rank: 'Biologist', minXP: 1500, color: '#8b5cf6', icon: '🧬' },
  { rank: 'Ecologist', minXP: 3000, color: '#f59e0b', icon: '🌍' },
  { rank: 'Geneticist', minXP: 6000, color: '#ef4444', icon: '🧪' },
  { rank: 'Professor', minXP: 10000, color: '#06b6d4', icon: '🎓' },
]

export function getRankForXP(xp: number): Rank {
  const rank = [...RANKS].reverse().find(r => xp >= r.minXP)
  return rank?.rank ?? 'Young Naturalist'
}

export function getNextRank(currentRank: Rank): Rank | null {
  const idx = RANKS.findIndex(r => r.rank === currentRank)
  return idx < RANKS.length - 1 ? RANKS[idx + 1].rank : null
}

export function getXPToNextRank(xp: number, currentRank: Rank): number {
  const next = getNextRank(currentRank)
  if (!next) return 0
  const nextRankData = RANKS.find(r => r.rank === next)!
  return nextRankData.minXP - xp
}
