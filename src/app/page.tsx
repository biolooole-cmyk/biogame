import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Microscope, Trophy, BookOpen, Zap, Star, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
            🔬
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            BioQuest STEM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">Biology learning reimagined for grades 7-9</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Learn Biology Like a{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Detective
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Solve real biological mysteries, analyze evidence, and make scientific discoveries.
          No boring tests — just thrilling STEM missions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup">
            <Button size="xl" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/30 text-white">
              Start Your Mission <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login?role=teacher">
            <Button size="xl" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
              I&apos;m a Teacher
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '24+', label: 'Missions' },
            { value: '6', label: 'Rank Levels' },
            { value: '3', label: 'Grade Levels' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Preview Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Sample <span className="text-emerald-400">Missions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              grade: 7, icon: '🌿', title: 'Why Is the Plant Dying?',
              desc: 'Investigate the mysterious illness spreading through the school greenhouse.',
              diff: 'Easy', category: 'Rescue', xp: 150
            },
            {
              grade: 8, icon: '🦠', title: 'Epidemic at School',
              desc: 'Track a mysterious outbreak and stop it before the whole school falls ill.',
              diff: 'Hard', category: 'Crisis', xp: 350
            },
            {
              grade: 9, icon: '🚀', title: 'Build a Biosphere on Mars',
              desc: 'Design a self-sustaining ecosystem for the first Mars colony.',
              diff: 'Hard', category: 'Investigation', xp: 500
            },
          ].map(mission => (
            <div key={mission.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{mission.icon}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/20">
                  Grade {mission.grade}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                {mission.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4">{mission.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{mission.category} • {mission.diff}</span>
                <span className="text-yellow-400 font-semibold">+{mission.xp} XP ⭐</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why <span className="text-emerald-400">BioQuest</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Microscope className="w-6 h-6" />, title: 'Real Science', desc: 'Evidence-based investigation missions built on actual biology curriculum.' },
            { icon: <Trophy className="w-6 h-6" />, title: 'Gamified Learning', desc: 'Earn XP, unlock ranks from Young Naturalist to Professor, collect achievements.' },
            { icon: <BookOpen className="w-6 h-6" />, title: 'Digital Notebook', desc: 'Record hypotheses, observations, and conclusions like a real scientist.' },
            { icon: <Zap className="w-6 h-6" />, title: 'AI Assistant', desc: 'BioBot gives Socratic hints — never direct answers — to guide your thinking.' },
            { icon: <Users className="w-6 h-6" />, title: 'Teacher Dashboard', desc: 'Create classes, assign missions, track student progress with analytics.' },
            { icon: <Star className="w-6 h-6" />, title: 'Mission Builder', desc: 'Teachers can build custom missions or use AI to generate them instantly.' },
          ].map(feat => (
            <div key={feat.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                {feat.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ranks Preview */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Rise Through the <span className="text-emerald-400">Ranks</span>
        </h2>
        <p className="text-slate-400 text-center mb-12">Complete missions, earn XP, and unlock higher scientific titles</p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { rank: 'Young Naturalist', icon: '🌱', xp: '0 XP', color: 'from-green-500 to-emerald-500' },
            { rank: 'Researcher', icon: '🔬', xp: '500 XP', color: 'from-blue-500 to-cyan-500' },
            { rank: 'Biologist', icon: '🧬', xp: '1,500 XP', color: 'from-purple-500 to-violet-500' },
            { rank: 'Ecologist', icon: '🌍', xp: '3,000 XP', color: 'from-yellow-500 to-orange-500' },
            { rank: 'Geneticist', icon: '🧪', xp: '6,000 XP', color: 'from-red-500 to-pink-500' },
            { rank: 'Professor', icon: '🎓', xp: '10,000 XP', color: 'from-cyan-500 to-teal-500' },
          ].map((r, i) => (
            <div key={r.rank} className={`bg-gradient-to-br ${r.color} p-px rounded-2xl`}>
              <div className="bg-slate-950 rounded-2xl px-5 py-3 flex items-center gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-sm">{r.rank}</div>
                  <div className="text-xs text-slate-400">{r.xp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to become a <span className="text-emerald-400">Biology Detective</span>?</h2>
        <p className="text-slate-400 mb-8">Join thousands of students discovering the excitement of real science.</p>
        <Link href="/signup">
          <Button size="xl" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl shadow-emerald-500/30 text-white">
            Start Free Today <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <span>🔬 BioQuest STEM — Making biology an adventure for grades 7-9</span>
        </div>
      </footer>
    </div>
  )
}
