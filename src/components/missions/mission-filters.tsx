'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const grades = [
  { label: 'All Grades', value: '' },
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
]

const difficulties = [
  { label: 'All Levels', value: '' },
  { label: '🟢 Easy', value: 'easy' },
  { label: '🟡 Medium', value: 'medium' },
  { label: '🔴 Hard', value: 'hard' },
]

const categories = [
  { label: 'All Types', value: '' },
  { label: '🔍 Mystery', value: 'mystery' },
  { label: '🔬 Investigation', value: 'investigation' },
  { label: '🌿 Rescue', value: 'rescue' },
  { label: '⚗️ Lab', value: 'lab' },
  { label: '🚨 Crisis', value: 'crisis' },
]

export function MissionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/missions?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-muted-foreground self-center w-16">Grade:</span>
        {grades.map(g => (
          <Button
            key={g.value}
            size="sm"
            variant={searchParams.get('grade') === g.value || (!searchParams.get('grade') && g.value === '') ? 'default' : 'outline'}
            onClick={() => setFilter('grade', g.value)}
          >
            {g.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-muted-foreground self-center w-16">Level:</span>
        {difficulties.map(d => (
          <Button
            key={d.value}
            size="sm"
            variant={searchParams.get('difficulty') === d.value || (!searchParams.get('difficulty') && d.value === '') ? 'default' : 'outline'}
            onClick={() => setFilter('difficulty', d.value)}
          >
            {d.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-muted-foreground self-center w-16">Type:</span>
        {categories.map(c => (
          <Button
            key={c.value}
            size="sm"
            variant={searchParams.get('category') === c.value || (!searchParams.get('category') && c.value === '') ? 'default' : 'outline'}
            onClick={() => setFilter('category', c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
