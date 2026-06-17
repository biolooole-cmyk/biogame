import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import type { UserRole } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  let xp: number | undefined
  let rank: string | undefined

  if (profile.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('xp_total')
      .eq('user_id', user.id)
      .single()
    xp = student?.xp_total ?? 0
    // Simple rank calc
    const xpVal = xp ?? 0
    if (xpVal >= 10000) rank = 'Professor'
    else if (xpVal >= 6000) rank = 'Geneticist'
    else if (xpVal >= 3000) rank = 'Ecologist'
    else if (xpVal >= 1500) rank = 'Biologist'
    else if (xpVal >= 500) rank = 'Researcher'
    else rank = 'Young Naturalist'
  }

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar
          role={profile.role as UserRole}
          userName={profile.full_name}
          userInitials={initials}
          xp={xp}
          rank={rank}
        />
      </div>
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav role={profile.role as UserRole} />
    </div>
  )
}
