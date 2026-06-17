import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RANKS, getRankForXP, getNextRank, getXPToNextRank } from '@/types'
import { SAMPLE_MISSIONS, ACHIEVEMENTS_DATA } from '@/lib/constants'
import { Target, Trophy, Flame, Star, ArrowRight, Lock, CheckCircle, PlayCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  if (profile.role === 'teacher') redirect('/teacher/dashboard')

  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()
  const xp = student?.xp_total ?? 0
  const currentRank = getRankForXP(xp)
  const nextRank = getNextRank(currentRank)
  const xpToNext = getXPToNextRank(xp, currentRank)
  const currentRankData = RANKS.find(r => r.rank === currentRank)!
  const nextRankData = nextRank ? RANKS.find(r => r.rank === nextRank) : null
  const xpProgress = nextRankData ? Math.round(((xp - currentRankData.minXP) / (nextRankData.minXP - currentRankData.minXP)) * 100) : 100

  const { data: progressData } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('student_id', student?.id ?? '')
    .order('started_at', { ascending: false })
    .limit(5)

  const completedIds = new Set((progressData ?? []).filter(p => p.status === 'completed').map(p => p.mission_id))
  const inProgressIds = new Set((progressData ?? []).filter(p => p.status === 'in_progress').map(p => p.mission_id))
  const grade = student?.grade ?? 7
  const gradeHints = [grade - 1, grade, grade + 1].filter(g => g >= 7 && g <= 9) as (7|8|9)[]
  const availableMissions = SAMPLE_MISSIONS.filter(m => gradeHints.includes(m.grade as 7|8|9)).slice(0, 3)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">
            Welcome back, {profile.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Ready for your next mission?</p>
        </div>
        <Link href="/missions">
          <Button size="lg" className="hidden sm:flex">
            Browse Missions <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Total XP', value: xp.toLocaleString(), sub: 'points earned' },
          { icon: <Target className="w-5 h-5 text-emerald-500" />, label: 'Missions', value: student?.missions_completed ?? 0, sub: 'completed' },
          { icon: <Flame className="w-5 h-5 text-orange-500" />, label: 'Streak', value: `${student?.streak_days ?? 0}`, sub: 'days active' },
          { icon: <Trophy className="w-5 h-5 text-purple-500" />, label: 'Grade', value: `Grade ${grade}`, sub: 'biology student' },
        ].map(stat => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-sm text-muted-foreground">{stat.label}</span></div>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rank progress */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentRankData.icon}</span>
              <div>
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <h3 className="text-xl font-black" style={{ color: currentRankData.color }}>{currentRank}</h3>
              </div>
            </div>
            {nextRankData && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next rank</p>
                <p className="font-semibold flex items-center gap-1">
                  <span>{nextRankData.icon}</span> {nextRank}
                </p>
                <p className="text-xs text-muted-foreground">{xpToNext.toLocaleString()} XP away</p>
              </div>
            )}
          </div>
          <Progress value={xpProgress} className="h-4" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{xp.toLocaleString()} / {nextRankData?.minXP.toLocaleString() ?? '∞'} XP</p>
        </CardContent>
      </Card>

      {/* Available missions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recommended Missions</h2>
          <Link href="/missions" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableMissions.map(mission => {
            const isCompleted = completedIds.has(mission.id)
            const isInProgress = inProgressIds.has(mission.id)
            return (
              <Card key={mission.id} className={`group hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}>
                <div className={`h-2 ${mission.difficulty === 'easy' ? 'bg-green-500' : mission.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{
                        mission.category === 'rescue' ? '🌿' :
                        mission.category === 'mystery' ? '🔍' :
                        mission.category === 'crisis' ? '🚨' :
                        mission.category === 'lab' ? '🧪' : '🔬'
                      }</span>
                      <Badge variant={mission.difficulty as 'easy' | 'medium' | 'hard'}>{mission.difficulty}</Badge>
                    </div>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                    {isInProgress && <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-500 transition-colors">{mission.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{mission.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{mission.estimated_minutes} min</span>
                    <span className="text-xs font-semibold text-yellow-500">+{mission.xp_reward} XP</span>
                  </div>
                  <Link href={`/missions/${mission.id}`}>
                    <Button size="sm" className="w-full mt-3" variant={isCompleted ? 'outline' : 'default'}>
                      {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Mission'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Achievements teaser */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Achievements</h2>
          <Link href="/achievements" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS_DATA.slice(0, 4).map(ach => (
            <Card key={ach.id} className="text-center p-4 opacity-50 hover:opacity-100 transition-opacity">
              <div className="text-3xl mb-2">{ach.icon}</div>
              <p className="text-xs font-bold">{ach.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
