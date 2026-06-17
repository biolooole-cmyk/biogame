'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Target, BookOpen, Trophy, Users } from 'lucide-react'
import type { UserRole } from '@/types'

interface MobileNavProps {
  role: UserRole
}

const studentLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/missions', icon: Target, label: 'Missions' },
  { href: '/notebook', icon: BookOpen, label: 'Notebook' },
  { href: '/achievements', icon: Trophy, label: 'Ranks' },
]

const teacherLinks = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/teacher/classes', icon: Users, label: 'Classes' },
  { href: '/teacher/missions', icon: Target, label: 'Missions' },
  { href: '/teacher/analytics', icon: Trophy, label: 'Analytics' },
]

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()
  const links = role === 'teacher' ? teacherLinks : studentLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
