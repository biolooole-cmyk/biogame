'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { BioBot } from '@/components/missions/bio-bot'
import {
  ChevronRight, ChevronLeft, BookOpen, Star,
  CheckCircle, Microscope, FileText, Lightbulb, Trophy
} from 'lucide-react'
import type { Mission, MissionProgress } from '@/types'

interface MissionPlayerProps {
  mission: Mission
  student: { id: string; grade: number } | null
  initialProgress: MissionProgress | null
}

const MISSION_STEPS = [
  { id: 'story', label: 'Briefing', icon: '📋' },
  { id: 'evidence', label: 'Evidence', icon: '🔍' },
  { id: 'investigation', label: 'Investigate', icon: '🧪' },
  { id: 'hypothesis', label: 'Hypothesis', icon: '💡' },
  { id: 'conclusion', label: 'Conclusion', icon: '🎯' },
]

const EVIDENCE_BY_MISSION: Record<string, Array<{ title: string; content: string; type: string; icon: string }>> = {
  'mission-1': [
    { title: 'Water pH Reading', content: 'pH: 4.2 (normal range: 6.0-7.5)\nThis is highly acidic for most plants.', type: 'data', icon: '💧' },
    { title: 'Soil Analysis', content: 'Nitrogen: LOW\nPhosphorus: NORMAL\nPotassium: LOW\nThe soil is nutrient-depleted.', type: 'data', icon: '🌱' },
    { title: 'Leaf Observation', content: 'Brown edges on leaves\nYellow chlorosis patterns\nWilting despite watering\nIndicates: nutrient deficiency or root damage', type: 'text', icon: '🍂' },
    { title: 'Root Sample', content: 'Root tips appear dark brown\nNo new root growth visible\nPossible root rot detected', type: 'image', icon: '🔬' },
  ],
  'mission-2': [
    { title: 'Microscope Slide A', content: 'Circular cell shape\nNo cell wall visible\nMembrane-bound nucleus present\nSmall mitochondria visible', type: 'data', icon: '🔬' },
    { title: 'Microscope Slide B', content: 'Rectangular cell shape\nThick cell wall visible\nLarge central vacuole\nChloroplasts present (green)', type: 'data', icon: '🔬' },
    { title: 'Size Measurement', content: 'Cell A diameter: 10-20 micrometers\nCell B dimensions: 100-200 x 20-50 micrometers\nCell B is significantly larger', type: 'data', icon: '📏' },
    { title: 'Staining Results', content: 'Iodine test on Cell B: BLUE-BLACK positive\nIndicates presence of starch\nConsistent with photosynthesis', type: 'text', icon: '🧪' },
  ],
}

const DEFAULT_EVIDENCE = [
  { title: 'Field Observation Notes', content: 'Initial survey complete.\nMultiple anomalies detected.\nFurther investigation required.\nCollect additional samples before drawing conclusions.', type: 'text', icon: '📋' },
  { title: 'Environmental Data', content: 'Temperature: 18°C (normal)\nHumidity: 65% (elevated)\nLight exposure: 6 hours/day\nWater source: tap water (chlorinated)', type: 'data', icon: '🌡️' },
  { title: 'Sample Analysis', content: 'Primary sample collected\nColor: pale green (abnormal)\nTexture: soft and mushy\nSmell: faint sulfur odor\nWeight: 15% below normal', type: 'data', icon: '🔬' },
]

export function MissionPlayer({ mission, student, initialProgress }: MissionPlayerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(initialProgress?.current_step ?? 0)
  const [hypothesis, setHypothesis] = useState(initialProgress?.hypothesis ?? '')
  const [conclusion, setConclusion] = useState(initialProgress?.conclusion ?? '')
  const [notes, setNotes] = useState(initialProgress?.notes ?? '')
  const [score, setScore] = useState<number | null>(initialProgress?.score ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [started, setStarted] = useState(!!initialProgress)

  const evidence = EVIDENCE_BY_MISSION[mission.id] ?? DEFAULT_EVIDENCE
  const totalSteps = MISSION_STEPS.length
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100)

  async function startMission() {
    if (!student) return
    const supabase = createClient()
    await supabase.from('mission_progress').upsert({
      student_id: student.id,
      mission_id: mission.id,
      status: 'in_progress',
      current_step: 0,
    })
    setStarted(true)
  }

  async function saveProgress(step: number) {
    if (!student) return
    const supabase = createClient()
    await supabase.from('mission_progress').upsert({
      student_id: student.id,
      mission_id: mission.id,
      status: 'in_progress',
      current_step: step,
      hypothesis,
      notes,
    })
  }

  async function submitMission() {
    if (!student) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const calculatedScore = Math.max(60, Math.min(100,
        60 + (hypothesis.length > 50 ? 15 : 0) + (conclusion.length > 100 ? 15 : 0) + (notes.length > 30 ? 10 : 0)
      ))
      setScore(calculatedScore)

      await supabase.from('mission_progress').upsert({
        student_id: student.id,
        mission_id: mission.id,
        status: 'completed',
        current_step: totalSteps - 1,
        score: calculatedScore,
        hypothesis,
        conclusion,
        notes,
        completed_at: new Date().toISOString(),
      })

      const xpEarned = Math.round(mission.xp_reward * (calculatedScore / 100))
      await supabase.from('students').update({
        xp_total: student.id,
        missions_completed: 1,
      }).eq('id', student.id)

      // Fire-and-forget XP update (RPC may not be deployed yet)
      void Promise.resolve(supabase.rpc('increment_xp', { student_id: student.id, xp_amount: xpEarned }))

      toast({
        title: `Mission Complete! 🎉`,
        description: `Score: ${calculatedScore}% • +${xpEarned} XP earned!`,
        variant: 'success' as any,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  function goNext() {
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      saveProgress(next)
    }
  }

  function goPrev() {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-6xl mb-6">
              {mission.category === 'rescue' ? '🌿' : mission.category === 'mystery' ? '🔍' : mission.category === 'crisis' ? '🚨' : '🔬'}
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="grade">Grade {mission.grade}</Badge>
              <Badge variant={mission.difficulty as 'easy' | 'medium' | 'hard'} className="capitalize">{mission.difficulty}</Badge>
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">+{mission.xp_reward} XP</Badge>
            </div>
            <h1 className="text-3xl font-black mb-4">{mission.title}</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">{mission.description}</p>

            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
              <span>⏱️ ~{mission.estimated_minutes} minutes</span>
              <span>📚 5 steps</span>
              <span>🔬 Evidence analysis</span>
            </div>

            <Button size="xl" onClick={startMission} className="min-w-48">
              🚀 Begin Mission
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stepKey = MISSION_STEPS[currentStep].id

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black">{mission.title}</h1>
            <p className="text-sm text-muted-foreground">{MISSION_STEPS[currentStep].icon} {MISSION_STEPS[currentStep].label}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currentStep + 1}/{totalSteps}</span>
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">+{mission.xp_reward} XP</Badge>
          </div>
        </div>
        <Progress value={progressPct} className="h-2" />
        <div className="flex mt-2 gap-1">
          {MISSION_STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`flex-1 text-center text-xs font-medium transition-colors ${i <= currentStep ? 'text-emerald-500' : 'text-muted-foreground'}`}
            >
              {step.icon}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {stepKey === 'story' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" /> Mission Briefing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-line">{mission.storyline}</p>
                </div>
                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm font-semibold text-emerald-600 mb-1">🎯 Your Mission:</p>
                  <p className="text-sm text-muted-foreground">
                    Analyze the evidence, form a scientific hypothesis, and present your conclusion.
                    Use your notebook to record observations!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {stepKey === 'evidence' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Microscope className="w-5 h-5 text-emerald-500" /> Evidence Collection
              </h2>
              {evidence.map((ev, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{ev.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm">Evidence #{i + 1}: {ev.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize mt-0.5">{ev.type}</Badge>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{ev.content}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {stepKey === 'investigation' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" /> Investigation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Record your observations and analysis here. What patterns do you notice?
                  What do the different pieces of evidence tell you?
                </p>
                <Textarea
                  placeholder="Write your investigation notes here...

Example:
- The pH level is very low (acidic)
- The soil lacks nitrogen and potassium
- These two facts might be related because..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">{notes.length} characters • Think like a detective!</p>
              </CardContent>
            </Card>
          )}

          {stepKey === 'hypothesis' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> Form Your Hypothesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-blue-600 mb-1">💡 What is a hypothesis?</p>
                  <p className="text-xs text-muted-foreground">
                    A hypothesis is a testable explanation for what you observed. Start with &quot;I think... because...&quot;
                    and use the evidence you collected.
                  </p>
                </div>
                <Textarea
                  placeholder="I think the problem is caused by... because the evidence shows...

For example: 'I think the plant is dying because the soil pH is too acidic (4.2), which prevents the roots from absorbing nutrients. This explains the brown leaves and low potassium levels.'"
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  className="min-h-[180px] text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">{hypothesis.length} characters • Be specific and reference the evidence!</p>
              </CardContent>
            </Card>
          )}

          {stepKey === 'conclusion' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Final Conclusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {score !== null ? (
                  <div className="text-center py-8">
                    <div className="text-7xl mb-4">
                      {score >= 90 ? '🏆' : score >= 75 ? '🥈' : '🥉'}
                    </div>
                    <h3 className="text-3xl font-black mb-2">
                      Score: <span className="text-emerald-500">{score}%</span>
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {score >= 90 ? 'Outstanding scientific work!' : score >= 75 ? 'Great investigation!' : 'Good effort! Keep practicing!'}
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={() => router.push('/missions')}>
                        More Missions
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                      <p className="text-xs font-semibold text-yellow-600 mb-1">🎯 Your Hypothesis:</p>
                      <p className="text-xs text-muted-foreground italic">{hypothesis || 'No hypothesis recorded'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Write your final conclusion. Does the evidence support your hypothesis?
                      What would you recommend as a solution?
                    </p>
                    <Textarea
                      placeholder="Based on my investigation, I conclude that...

The evidence supports this because...

My recommendation is..."
                      value={conclusion}
                      onChange={e => setConclusion(e.target.value)}
                      className="min-h-[180px] text-sm mb-4"
                    />
                    <Button
                      onClick={submitMission}
                      disabled={submitting || conclusion.length < 20}
                      size="lg"
                      className="w-full"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : '🎯 Submit Mission'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          {score === null && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={goPrev} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              {currentStep < totalSteps - 1 && (
                <Button onClick={goNext}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: BioBot + Quick notes */}
        <div className="space-y-4">
          <BioBot missionContext={mission.title} gradeLevel={student?.grade ?? 7} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Mission Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MISSION_STEPS.map((step, i) => (
                <div key={step.id} className={`flex items-center gap-2 text-sm ${i < currentStep ? 'text-emerald-500' : i === currentStep ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {i < currentStep ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                  {step.icon} {step.label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
