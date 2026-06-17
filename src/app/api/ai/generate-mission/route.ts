import { NextRequest, NextResponse } from 'next/server'
import { generateMission } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, grade } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const mission = await generateMission(prompt, grade ?? 7)
    return NextResponse.json({ mission })
  } catch (error) {
    console.error('Mission generation error:', error)
    // Return a sample mission as fallback
    return NextResponse.json({
      mission: {
        title: 'The Mystery of the Missing Chlorophyll',
        description: 'Plants in the school garden are turning yellow. Investigate why!',
        storyline: 'The school garden caretaker noticed that several plants have been turning yellow over the past week. Even though the plants are being watered regularly, something is clearly wrong. As junior biologists, your team has been called in to investigate.',
        evidence: [
          { title: 'Leaf Color Analysis', description: 'Color measurements from affected plants', content: 'Healthy leaf: Dark green (chlorophyll index: 45)\nAffected leaf: Pale yellow (chlorophyll index: 8)\nSeverely affected: Almost white (chlorophyll index: 2)', type: 'data' },
          { title: 'Soil Nutrient Report', description: 'Laboratory analysis of soil samples', content: 'Iron (Fe): VERY LOW — 0.2 ppm (normal: 2-5 ppm)\nMagnesium (Mg): LOW — 45 ppm (normal: 100-300 ppm)\nNitrogen (N): NORMAL\npH: 7.8 (slightly alkaline)', type: 'data' },
        ],
        questions: [
          { question_text: 'Which nutrient is most likely causing the yellowing?', question_type: 'multiple_choice', options: ['Nitrogen', 'Iron', 'Carbon', 'Water'], hint: 'Think about which element is at the most critically low level compared to its normal range.' },
          { question_text: 'Write a hypothesis explaining the yellow color based on the evidence.', question_type: 'hypothesis', hint: 'Remember: chlorophyll makes plants green. What does chlorophyll need to form?' },
        ],
        conclusion_guide: 'A strong conclusion should identify iron deficiency (chlorosis) as the cause, explain that iron is needed for chlorophyll production, and suggest adding iron chelate or adjusting soil pH to allow better iron absorption.',
      }
    })
  }
}
