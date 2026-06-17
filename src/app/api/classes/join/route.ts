import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: 'Class code is required' }, { status: 400 })

  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (!cls) return NextResponse.json({ error: 'Invalid class code' }, { status: 404 })

  const { data: student } = await supabase
    .from('students')
    .select('id, grade')
    .eq('user_id', user.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const { error } = await supabase
    .from('students')
    .update({ class_id: cls.id })
    .eq('id', student.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, class: cls })
}
