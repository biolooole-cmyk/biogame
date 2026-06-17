import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotebookView } from '@/components/notebook/notebook-view'

export default async function NotebookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single()

  const { data: entries } = await supabase
    .from('notebook_entries')
    .select('*')
    .eq('student_id', student?.id ?? '')
    .order('created_at', { ascending: false })

  return <NotebookView entries={entries ?? []} studentId={student?.id ?? ''} />
}
