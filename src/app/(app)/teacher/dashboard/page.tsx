import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { Users, Target, BarChart3, Plus, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'teacher') redirect('/dashboard')

  const { data: teacher } = await supabase.from('teachers').select('*').eq('user_id', user.id).single()

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacher?.id ?? '')

  const classIds = (classes ?? []).map(c => c.id)

  const { data: students } = await supabase
    .from('students')
    .select('*, profiles(full_name)')
    .in('class_id', classIds.length ? classIds : ['none'])

  const { data: completedMissions } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('status', 'completed')
    .in('student_id', (students ?? []).map(s => s.id))

  const totalStudents = students?.length ?? 0
  const totalClasses = classes?.length ?? 0
  const totalCompletions = completedMissions?.length ?? 0
  const avgScore = completedMissions?.length
    ? Math.round((completedMissions.reduce((sum, m) => sum + (m.score ?? 0), 0)) / completedMissions.length)
    : 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Teacher Dashboard 🎓</h1>
          <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/classes/new">
            <Button variant="outline"><Plus className="w-4 h-4" /> New Class</Button>
          </Link>
          <Link href="/teacher/missions/builder">
            <Button><Plus className="w-4 h-4" /> Build Mission</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5 text-blue-500" />, label: 'Total Students', value: totalStudents },
          { icon: <BookOpen className="w-5 h-5 text-emerald-500" />, label: 'Active Classes', value: totalClasses },
          { icon: <Target className="w-5 h-5 text-purple-500" />, label: 'Completions', value: totalCompletions },
          { icon: <BarChart3 className="w-5 h-5 text-yellow-500" />, label: 'Avg Score', value: `${avgScore}%` },
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
        {/* Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Classes</CardTitle>
            <Link href="/teacher/classes">
              <Button variant="ghost" size="sm">View all <ArrowRight className="w-3 h-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {classes?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">No classes yet</p>
                <Link href="/teacher/classes/new">
                  <Button size="sm"><Plus className="w-4 h-4" /> Create First Class</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(classes ?? []).slice(0, 4).map(cls => (
                  <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group cursor-pointer">
                      <div>
                        <p className="font-semibold text-sm group-hover:text-emerald-500 transition-colors">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">Grade {cls.grade} • Code: {cls.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(students ?? []).filter(s => s.class_id === cls.id).length} students
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Mission Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalCompletions === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No mission completions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(completedMissions ?? []).slice(0, 5).map(prog => {
                  const mission = SAMPLE_MISSIONS.find(m => m.id === prog.mission_id)
                  const student = (students ?? []).find(s => s.id === prog.student_id)
                  return (
                    <div key={prog.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="font-semibold text-xs">{mission?.title ?? 'Unknown Mission'}</p>
                        <p className="text-xs text-muted-foreground">{(student as any)?.profiles?.full_name ?? 'Student'}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${prog.score && prog.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                          {prog.score}%
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick mission assign */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Missions</CardTitle>
          <Link href="/teacher/missions">
            <Button variant="ghost" size="sm">Manage <ArrowRight className="w-3 h-3" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_MISSIONS.slice(0, 3).map(mission => (
              <div key={mission.id} className="p-4 rounded-xl border hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="grade">Gr {mission.grade}</Badge>
                  <Badge variant={mission.difficulty as any} className="capitalize">{mission.difficulty}</Badge>
                </div>
                <p className="font-bold text-sm mb-1">{mission.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{mission.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
