import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SAMPLE_MISSIONS } from '@/lib/constants'
import { MissionPlayer } from '@/components/missions/mission-player'

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const mission = SAMPLE_MISSIONS.find(m => m.id === id)
  if (!mission) notFound()

  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()

  let progress = null
  if (student) {
    const { data } = await supabase
      .from('mission_progress')
      .select('*')
      .eq('student_id', student.id)
      .eq('mission_id', id)
      .single()
    progress = data
  }

  return (
    <MissionPlayer
      mission={mission as any}
      student={student}
      initialProgress={progress}
    />
  )
}
