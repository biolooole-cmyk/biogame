'use client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, Star, CheckCircle, PlayCircle } from 'lucide-react'
import type { Mission, MissionProgress } from '@/types'

interface MissionCardProps {
  mission: Mission
  progress?: MissionProgress
}

const CATEGORY_ICONS: Record<string, string> = {
  mystery: '🔍',
  investigation: '🔬',
  rescue: '🌿',
  lab: '⚗️',
  crisis: '🚨',
}

const GRADE_COLORS: Record<number, string> = {
  7: 'from-green-500 to-emerald-500',
  8: 'from-blue-500 to-cyan-500',
  9: 'from-purple-500 to-violet-500',
}

export function MissionCard({ mission, progress }: MissionCardProps) {
  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'
  const progressPct = isCompleted ? 100 : isInProgress ? Math.round((progress.current_step / 5) * 100) : 0

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${GRADE_COLORS[mission.grade] ?? 'from-gray-500 to-gray-400'}`} />

      <CardContent className="pt-5 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{CATEGORY_ICONS[mission.category] ?? '🔬'}</span>
            <div>
              <Badge variant="grade" className="text-xs">Grade {mission.grade}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={mission.difficulty as 'easy' | 'medium' | 'hard'} className="capitalize">
              {mission.difficulty}
            </Badge>
            {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {isInProgress && <PlayCircle className="w-4 h-4 text-blue-500" />}
          </div>
        </div>

        {/* Title & description */}
        <div>
          <h3 className="font-bold text-base leading-tight group-hover:text-emerald-500 transition-colors mb-1">
            {mission.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{mission.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {(mission.tags ?? []).slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar (if started) */}
        {(isInProgress || isCompleted) && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{isCompleted ? 'Completed' : 'In progress'}</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {mission.estimated_minutes}m
            </span>
            <span className="flex items-center gap-1 text-yellow-500 font-semibold">
              <Star className="w-3 h-3 fill-yellow-500" /> {mission.xp_reward} XP
            </span>
          </div>
        </div>

        <Link href={`/missions/${mission.id}`}>
          <Button
            className="w-full"
            variant={isCompleted ? 'outline' : 'default'}
            size="sm"
          >
            {isCompleted ? '✓ Review Mission' : isInProgress ? '▶ Continue' : '🚀 Start Mission'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
