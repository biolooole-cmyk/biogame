import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { getRankForXP } from '@/types'
import { ArrowLeft, Users, Copy, Target } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cls } = await supabase.from('classes').select('*').eq('id', id).single()
  if (!cls) notFound()

  const { data: students } = await supabase
    .from('students')
    .select('*, profiles(full_name, email)')
    .eq('class_id', id)

  const studentIds = (students ?? []).map(s => s.id)

  const { data: allProgress } = await supabase
    .from('mission_progress')
    .select('*')
    .in('student_id', studentIds.length ? studentIds : ['none'])

  const progressByStudent = (allProgress ?? []).reduce((acc, p) => {
    if (!acc[p.student_id]) acc[p.student_id] = []
    acc[p.student_id].push(p)
    return acc
  }, {} as Record<string, Array<{ status: string; score: number | null; student_id: string }>>)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Classes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">{cls.name}</h1>
          <p className="text-muted-foreground">Grade {cls.grade} • {(students ?? []).length} students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-muted/50 rounded-xl flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Join code:</span>
            <code className="font-black text-emerald-600 tracking-widest">{cls.code}</code>
            <Copy className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
        </div>
      </div>

      {/* Student list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" /> Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(students ?? []).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No students yet. Share the code <strong className="text-emerald-600">{cls.code}</strong> with your students!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(students ?? []).map(student => {
                const studentProgress = progressByStudent[student.id] ?? []
                const completed = studentProgress.filter((p: { status: string }) => p.status === 'completed').length
                const avgScore = completed > 0
                  ? Math.round(studentProgress.filter((p: { status: string }) => p.status === 'completed').reduce((sum: number, p: { score: number | null }) => sum + (p.score ?? 0), 0) / completed)
                  : 0
                const rank = getRankForXP(student.xp_total ?? 0)
                return (
                  <div key={student.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {((student as any).profiles?.full_name ?? 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{(student as any).profiles?.full_name ?? 'Student'}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{rank}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{student.xp_total?.toLocaleString() ?? 0} XP • {completed} missions completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{avgScore > 0 ? `${avgScore}%` : '-'}</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
