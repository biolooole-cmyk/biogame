import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const { data: progress } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('student_id', student.id)

  return NextResponse.json({ progress })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { mission_id, status, current_step, hypothesis, conclusion, notes, score } = body

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('mission_progress')
    .upsert({
      student_id: student.id,
      mission_id,
      status,
      current_step,
      hypothesis,
      conclusion,
      notes,
      score,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP if completed
  if (status === 'completed' && score) {
    const xpEarned = Math.round(150 * (score / 100))
    try {
      await supabase.rpc('add_xp', { p_student_id: student.id, p_amount: xpEarned })
    } catch { /* XP RPC not yet deployed */ }
  }

  return NextResponse.json({ data })
}
