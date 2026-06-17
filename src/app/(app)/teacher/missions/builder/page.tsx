'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, ArrowLeft, Loader2, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function MissionBuilderPage() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [grade, setGrade] = useState<7|8|9>(7)
  const [generating, setGenerating] = useState(false)
  const [generatedMission, setGeneratedMission] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    story: true, evidence: true, questions: true,
  })

  async function generateMission() {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, grade }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGeneratedMission(data.mission)
      toast({ title: '✨ Mission generated!', description: 'Review and customize below.' })
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again',
      })
    } finally {
      setGenerating(false)
    }
  }

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/teacher/missions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Missions
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-500" /> AI Mission Builder
        </h1>
        <p className="text-muted-foreground mt-1">Describe a biology topic and our AI will generate a complete mission</p>
      </div>

      {/* Prompt card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Generate a Mission with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Grade Level</Label>
            <div className="flex gap-2">
              {([7, 8, 9] as const).map(g => (
                <Button
                  key={g}
                  variant={grade === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGrade(g)}
                >
                  Grade {g}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mission Prompt</Label>
            <Textarea
              placeholder={'Examples:\n"Create a mission about photosynthesis and why leaves turn yellow"\n"Design a mystery about a sick coral reef ecosystem"\n"Build an investigation about antibiotic resistance"'}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <Button
            onClick={generateMission}
            disabled={generating || !prompt.trim()}
            size="lg"
            className="w-full"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating mission...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate Mission
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated mission preview */}
      {generatedMission && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Generated Mission Preview</h2>
            <Button>Save Mission</Button>
          </div>

          {/* Title & Description */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="grade">Grade {grade}</Badge>
                <Badge>AI Generated</Badge>
              </div>
              <h3 className="text-2xl font-black mb-2">{generatedMission.title}</h3>
              <p className="text-muted-foreground">{generatedMission.description}</p>
            </CardContent>
          </Card>

          {/* Storyline */}
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection('story')}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="text-base flex items-center gap-2">📋 Mission Storyline</CardTitle>
                {expandedSections.story ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CardHeader>
            {expandedSections.story && (
              <CardContent>
                <Textarea
                  value={generatedMission.storyline}
                  onChange={e => setGeneratedMission((prev: any) => ({ ...prev, storyline: e.target.value }))}
                  className="min-h-[120px] text-sm"
                />
              </CardContent>
            )}
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection('evidence')}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="text-base flex items-center gap-2">🔍 Evidence Cards ({(generatedMission.evidence ?? []).length})</CardTitle>
                {expandedSections.evidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CardHeader>
            {expandedSections.evidence && (
              <CardContent className="space-y-3">
                {(generatedMission.evidence ?? []).map((ev: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/50 border">
                    <p className="font-semibold text-sm mb-1">#{i + 1}: {ev.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{ev.description}</p>
                    <Textarea
                      value={ev.content}
                      onChange={e => {
                        const newEvidence = [...generatedMission.evidence]
                        newEvidence[i] = { ...ev, content: e.target.value }
                        setGeneratedMission((prev: any) => ({ ...prev, evidence: newEvidence }))
                      }}
                      className="min-h-[80px] text-xs font-mono"
                    />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection('questions')}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="text-base flex items-center gap-2">❓ Questions ({(generatedMission.questions ?? []).length})</CardTitle>
                {expandedSections.questions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CardHeader>
            {expandedSections.questions && (
              <CardContent className="space-y-3">
                {(generatedMission.questions ?? []).map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{q.question_type}</Badge>
                    </div>
                    <p className="text-sm font-semibold mb-2">{q.question_text}</p>
                    {q.hint && (
                      <p className="text-xs text-muted-foreground">💡 Hint: {q.hint}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Conclusion guide */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-sm mb-2">🎯 Conclusion Guide</h3>
              <p className="text-sm text-muted-foreground">{generatedMission.conclusion_guide}</p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1">Save & Publish Mission</Button>
            <Button size="lg" variant="outline" onClick={generateMission}>
              <Sparkles className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
