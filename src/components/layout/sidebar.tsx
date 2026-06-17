'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Target, BookOpen, Trophy, Users,
  Settings, LogOut, Microscope, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import type { UserRole } from '@/types'

interface SidebarProps {
  role: UserRole
  userName: string
  userInitials: string
  xp?: number
  rank?: string
}

const studentLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/missions', icon: Target, label: 'Missions' },
  { href: '/notebook', icon: BookOpen, label: 'Notebook' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
]

const teacherLinks = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/classes', icon: Users, label: 'My Classes' },
  { href: '/teacher/missions', icon: Target, label: 'Missions' },
  { href: '/teacher/analytics', icon: Trophy, label: 'Analytics' },
]

export function Sidebar({ role, userName, userInitials, xp, rank }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const links = role === 'teacher' ? teacherLinks : studentLinks

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-border', collapsed && 'justify-center')}>
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
          🔬
        </div>
        {!collapsed && (
          <span className="font-black text-lg bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            BioQuest
          </span>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{userName}</p>
              {role === 'student' && (
                <p className="text-xs text-muted-foreground">{rank} • {xp?.toLocaleString()} XP</p>
              )}
              {role === 'teacher' && (
                <p className="text-xs text-muted-foreground">Teacher</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
