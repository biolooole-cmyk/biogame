'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, GraduationCap, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'student' | 'teacher'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [role, setRole] = useState<Role>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [grade, setGrade] = useState<7 | 8 | 9>(7)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Minimum 6 characters required.' })
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      if (role === 'student') {
        await supabase.from('students').insert({
          user_id: data.user.id,
          grade,
          xp_total: 0,
          streak_days: 0,
          missions_completed: 0,
        })
      } else {
        await supabase.from('teachers').insert({ user_id: data.user.id })
      }

      toast({
        title: '🚀 Welcome to BioQuest!',
        description: 'Your account has been created. Time to start your first mission!',
      })
      router.push(role === 'teacher' ? '/teacher/dashboard' : '/dashboard')
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
              🔬
            </div>
            <h1 className="text-2xl font-black text-white">Join BioQuest STEM</h1>
          </div>
          <p className="text-slate-400 text-sm ml-15">Begin your scientific investigation journey</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['student', 'teacher'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  role === r
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                )}
              >
                {r === 'student' ? <BookOpen className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                <span className="font-semibold capitalize">{r}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. Jane Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {role === 'student' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Grade Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([7, 8, 9] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={cn(
                        'py-2 rounded-xl border-2 font-bold transition-all text-sm',
                        grade === g
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      )}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-12 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                '🚀 Start My Journey'
              )}
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already a member?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
