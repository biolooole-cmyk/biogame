import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Copy } from 'lucide-react'
import Link from 'next/link'

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/dashboard')

  const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', user.id).single()

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacher?.id ?? '')
    .order('created_at', { ascending: false })

  const { data: students } = await supabase
    .from('students')
    .select('class_id')
    .in('class_id', (classes ?? []).map(c => c.id))

  const studentCountByClass = (students ?? []).reduce((acc, s) => {
    acc[s.class_id] = (acc[s.class_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">My Classes 📚</h1>
          <p className="text-muted-foreground">Manage your student groups</p>
        </div>
        <Link href="/teacher/classes/new">
          <Button><Plus className="w-4 h-4" /> New Class</Button>
        </Link>
      </div>

      {classes?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-xl font-bold mb-2">No classes yet</h3>
          <p className="text-muted-foreground mb-6">Create your first class and share the join code with students</p>
          <Link href="/teacher/classes/new">
            <Button size="lg"><Plus className="w-4 h-4" /> Create First Class</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(classes ?? []).map(cls => (
            <Card key={cls.id} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-md">
                    🏫
                  </div>
                  <Badge variant="grade">Grade {cls.grade}</Badge>
                </div>
                <h3 className="font-black text-lg mb-1 group-hover:text-emerald-500 transition-colors">{cls.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4" />
                  <span>{studentCountByClass[cls.id] ?? 0} students</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl mb-4">
                  <span className="text-xs text-muted-foreground">Join code:</span>
                  <code className="text-sm font-black text-emerald-600 tracking-widest">{cls.code}</code>
                  <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => navigator.clipboard.writeText(cls.code)}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <Link href={`/teacher/classes/${cls.id}`}>
                  <Button className="w-full" variant="outline">Manage Class</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
