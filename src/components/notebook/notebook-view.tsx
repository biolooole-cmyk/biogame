'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit3, Save, X, BookOpen } from 'lucide-react'
import type { NotebookEntry } from '@/types'

interface NotebookViewProps {
  entries: NotebookEntry[]
  studentId: string
}

const ENTRY_TYPES = [
  { value: 'hypothesis', label: '💡 Hypothesis', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { value: 'observation', label: '🔍 Observation', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { value: 'note', label: '📝 Note', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { value: 'conclusion', label: '🎯 Conclusion', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
]

export function NotebookView({ entries: initialEntries, studentId }: NotebookViewProps) {
  const { toast } = useToast()
  const [entries, setEntries] = useState(initialEntries)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<'hypothesis' | 'observation' | 'note' | 'conclusion'>('note')

  async function addEntry() {
    if (!newTitle || !newContent) return
    const supabase = createClient()
    const { data, error } = await supabase.from('notebook_entries').insert({
      student_id: studentId,
      title: newTitle,
      content: newContent,
      entry_type: newType,
    }).select().single()

    if (!error && data) {
      setEntries(prev => [data, ...prev])
      setNewTitle('')
      setNewContent('')
      setIsAdding(false)
      toast({ title: '📝 Entry saved!', description: 'Added to your notebook.' })
    }
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    await supabase.from('notebook_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
    toast({ title: 'Entry deleted' })
  }

  const typeInfo = (type: string) => ENTRY_TYPES.find(t => t.value === type) ?? ENTRY_TYPES[2]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-500" /> Science Notebook
          </h1>
          <p className="text-muted-foreground mt-1">Your personal scientific journal</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-base">New Notebook Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {ENTRY_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setNewType(type.value as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${newType === type.value ? type.color + ' ring-2 ring-current ring-offset-1' : 'bg-muted border-border'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <Input
              placeholder="Entry title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your observation, hypothesis, or note here..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={!newTitle || !newContent}>
                <Save className="w-4 h-4" /> Save Entry
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setNewTitle(''); setNewContent('') }}>
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && !isAdding ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📓</p>
          <h3 className="text-xl font-bold mb-2">Your notebook is empty</h3>
          <p className="text-muted-foreground mb-6">Start recording your scientific observations!</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Write First Entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(entry => {
            const type = typeInfo(entry.entry_type)
            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`text-xs ${type.color}`}>{type.label}</Badge>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold mb-2">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{entry.content}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
