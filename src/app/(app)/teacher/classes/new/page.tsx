'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { generateClassCode, cn } from '@/lib/utils'
import Link from 'next/link'

export default function NewClassPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<7|8|9>(7)
  const [loading, setLoading] = useState(false)

  async function createClass(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!teacher) throw new Error('Teacher profile not found')

      const code = generateClassCode()
      const { data, error } = await supabase.from('classes').insert({
        teacher_id: teacher.id,
        name,
        grade,
        code,
      }).select().single()

      if (error) throw error

      toast({
        title: '✅ Class created!',
        description: `Join code: ${code} — share this with your students!`,
      })
      router.push(`/teacher/classes/${data.id}`)
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to create class',
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Classes
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Class 🏫</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createClass} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                placeholder="e.g., Biology Period 3, 7A Science"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Grade Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {([7, 8, 9] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={cn(
                      'py-3 rounded-xl border-2 font-bold transition-all',
                      grade === g
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                        : 'border-border hover:border-emerald-500/30'
                    )}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium mb-1">📋 A unique join code will be generated automatically</p>
              <p className="text-xs text-muted-foreground">Students use this code to join your class. You can find it on the class management page.</p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading || !name}>
              {loading ? 'Creating...' : '✅ Create Class'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
