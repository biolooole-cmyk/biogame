import { NextRequest, NextResponse } from 'next/server'
import { getAIHint } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { question, context, gradeLevel } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const hint = await getAIHint(
      question,
      context ?? 'biology mission',
      gradeLevel ?? 7
    )

    return NextResponse.json({ hint })
  } catch (error) {
    console.error('AI hint error:', error)
    // Fallback hint when OpenAI is not configured
    return NextResponse.json({
      hint: "Great question! 🔬 Think about what you already know from the evidence. What patterns do you notice? What would a scientist look for first? Try connecting two pieces of evidence together!"
    })
  }
}
