import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { BarChart3, TrendingUp, Users, Trophy } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/dashboard')

  const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', user.id).single()
  const { data: classes } = await supabase.from('classes').select('*').eq('teacher_id', teacher?.id ?? '')
  const classIds = (classes ?? []).map(c => c.id)

  const { data: students } = await supabase.from('students').select('*, profiles(full_name)').in('class_id', classIds.length ? classIds : ['none'])
  const studentIds = (students ?? []).map(s => s.id)

  const { data: allProgress } = await supabase
    .from('mission_progress')
    .select('*')
    .in('student_id', studentIds.length ? studentIds : ['none'])

  const completed = (allProgress ?? []).filter(p => p.status === 'completed')
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, p) => sum + (p.score ?? 0), 0) / completed.length)
    : 0

  const missionCompletionMap = completed.reduce((acc, p) => {
    acc[p.mission_id] = (acc[p.mission_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topMissions = Object.entries(missionCompletionMap)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([id, count]) => ({
      mission: SAMPLE_MISSIONS.find(m => m.id === id),
      count: count as number,
    }))

  const topStudents = [...(students ?? [])]
    .sort((a, b) => (b.xp_total ?? 0) - (a.xp_total ?? 0))
    .slice(0, 5)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Analytics 📊</h1>
        <p className="text-muted-foreground">Track your students' learning progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users className="w-5 h-5 text-blue-500" />, label: 'Total Students', value: students?.length ?? 0 },
          { icon: <Trophy className="w-5 h-5 text-emerald-500" />, label: 'Missions Completed', value: completed.length },
          { icon: <BarChart3 className="w-5 h-5 text-purple-500" />, label: 'Average Score', value: `${avgScore}%` },
          { icon: <TrendingUp className="w-5 h-5 text-yellow-500" />, label: 'Total Classes', value: classes?.length ?? 0 },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-sm text-muted-foreground">{stat.label}</span></div>
              <div className="text-3xl font-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Missions by Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {topMissions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No completions yet</p>
            ) : (
              <div className="space-y-3">
                {topMissions.map(({ mission, count }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg font-black text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{mission?.title ?? 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round((count / (students?.length ?? 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{count} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Students by XP</CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No students enrolled yet</p>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, i) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <span className="text-lg font-black text-muted-foreground w-6">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                      {((student as any).profiles?.full_name ?? 'S').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{(student as any).profiles?.full_name ?? 'Student'}</p>
                      <p className="text-xs text-muted-foreground">{(student.xp_total ?? 0).toLocaleString()} XP</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {completed.filter(p => p.student_id === student.id).length} missions
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
