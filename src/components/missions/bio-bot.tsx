'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react'

interface BioBotProps {
  missionContext: string
  gradeLevel: number
}

interface Message {
  role: 'user' | 'bot'
  content: string
}

export function BioBot({ missionContext, gradeLevel }: BioBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: `Hi! I'm BioBot 🤖🔬 I'm here to help you think through this mission. I won't give you direct answers, but I'll ask guiding questions to help you discover the solution yourself! What are you curious about?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, context: missionContext, gradeLevel }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.hint }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: "Hmm, I'm having trouble connecting. Try again in a moment! 🔬" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            BioBot Assistant
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {!minimized && (
        <CardContent className="pt-0">
          <div className="h-48 overflow-y-auto space-y-2 mb-3 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-3 py-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="text-xs h-8"
              disabled={loading}
            />
            <Button size="icon" className="h-8 w-8 flex-shrink-0" onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
