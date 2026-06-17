import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherMissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/dashboard')

  const CATEGORY_ICONS: Record<string, string> = {
    mystery: '🔍', investigation: '🔬', rescue: '🌿', lab: '⚗️', crisis: '🚨',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Mission Library 🎯</h1>
          <p className="text-muted-foreground">Browse and assign missions to your classes</p>
        </div>
        <Link href="/teacher/missions/builder">
          <Button><Plus className="w-4 h-4" /> AI Mission Builder</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SAMPLE_MISSIONS.map(mission => (
          <Card key={mission.id} className="group hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{CATEGORY_ICONS[mission.category] ?? '🔬'}</span>
                  <div>
                    <Badge variant="grade" className="text-xs">Grade {mission.grade}</Badge>
                  </div>
                </div>
                <Badge variant={mission.difficulty as 'easy' | 'medium' | 'hard'} className="capitalize">{mission.difficulty}</Badge>
              </div>
              <h3 className="font-bold mb-1 group-hover:text-emerald-500 transition-colors">{mission.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{mission.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {(mission.tags ?? []).slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mission.estimated_minutes}m</span>
                <span className="flex items-center gap-1 text-yellow-500 font-semibold"><Star className="w-3 h-3 fill-yellow-500" />{mission.xp_reward} XP</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/missions/${mission.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Preview</Button>
                </Link>
                <Button size="sm" className="flex-1">Assign</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
