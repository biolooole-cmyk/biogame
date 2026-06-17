import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACHIEVEMENTS_DATA } from '@/lib/constants'
import { RANKS } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()
  const xp = student?.xp_total ?? 0

  const { data: earnedAchs } = await supabase
    .from('student_achievements')
    .select('achievement_id')
    .eq('student_id', student?.id ?? '')

  const earnedIds = new Set((earnedAchs ?? []).map(a => a.achievement_id))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Achievements & Ranks 🏆</h1>
        <p className="text-muted-foreground">Track your scientific journey</p>
      </div>

      {/* Rank progression */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Rank Progression</h2>
        <div className="space-y-3">
          {RANKS.map((rank, i) => {
            const isUnlocked = xp >= rank.minXP
            const nextRank = RANKS[i + 1]
            const progress = nextRank
              ? Math.min(100, Math.round(((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100))
              : 100
            const isCurrent = isUnlocked && (!nextRank || xp < nextRank.minXP)

            return (
              <Card key={rank.rank} className={`transition-all ${isCurrent ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10' : isUnlocked ? 'opacity-90' : 'opacity-50'}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{rank.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold" style={{ color: rank.color }}>{rank.rank}</h3>
                        {isCurrent && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Current</Badge>}
                        {!isUnlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rank.minXP.toLocaleString()} XP required</p>
                      {isCurrent && nextRank && (
                        <Progress value={progress} className="h-1.5" />
                      )}
                    </div>
                    {isUnlocked && <span className="text-xl">✓</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Achievements grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACHIEVEMENTS_DATA.map(ach => {
            const isEarned = earnedIds.has(ach.id)
            return (
              <Card key={ach.id} className={`text-center p-4 transition-all ${isEarned ? 'shadow-md' : 'opacity-50 grayscale'}`}>
                <div className="text-4xl mb-3">{ach.icon}</div>
                <h3 className="font-bold text-sm mb-1">{ach.name}</h3>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
                {isEarned && (
                  <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Earned!</Badge>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
