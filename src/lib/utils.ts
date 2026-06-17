import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-green-500'
    case 'medium': return 'text-yellow-500'
    case 'hard': return 'text-red-500'
    default: return 'text-gray-500'
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'mystery': return '🔍'
    case 'investigation': return '🧪'
    case 'rescue': return '🌿'
    case 'lab': return '⚗️'
    case 'crisis': return '🚨'
    default: return '🔬'
  }
}

export function generateClassCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
