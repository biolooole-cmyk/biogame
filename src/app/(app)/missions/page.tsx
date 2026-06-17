import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { MissionCard } from '@/components/missions/mission-card'
import { MissionFilters } from '@/components/missions/mission-filters'

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; difficulty?: string; category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()
  const { data: progressData } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('student_id', student?.id ?? '')

  const progressMap = new Map((progressData ?? []).map(p => [p.mission_id, p]))

  let missions = SAMPLE_MISSIONS
  if (params.grade) missions = missions.filter(m => m.grade === parseInt(params.grade!))
  if (params.difficulty) missions = missions.filter(m => m.difficulty === params.difficulty)
  if (params.category) missions = missions.filter(m => m.category === params.category)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Mission Control 🎯</h1>
        <p className="text-muted-foreground">Choose your next biological investigation</p>
      </div>

      <MissionFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {missions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission as any}
            progress={progressMap.get(mission.id)}
          />
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔭</p>
          <h3 className="text-xl font-bold mb-2">No missions found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
