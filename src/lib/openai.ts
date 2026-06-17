import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getAIHint(
  question: string,
  context: string,
  gradeLevel: number
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are BioBot, a friendly AI assistant helping Grade ${gradeLevel} students learn biology.
        You NEVER give direct answers. You provide Socratic hints and ask guiding questions.
        Use simple, age-appropriate language. Be encouraging and enthusiastic about science.
        Keep responses under 150 words. Use emojis occasionally to make it fun.
        Current mission context: ${context}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  })

  return response.choices[0].message.content ?? 'Great question! Think about what you already know about this topic. What clues from the evidence might help you?'
}

export async function generateMission(prompt: string, grade: number): Promise<{
  title: string
  description: string
  storyline: string
  evidence: Array<{ title: string; description: string; content: string; type: string }>
  questions: Array<{ question_text: string; question_type: string; options?: string[]; hint: string }>
  conclusion_guide: string
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert biology teacher creating engaging STEM missions for Grade ${grade} students.
        Create missions that feel like detective investigations. Include real scientific concepts.
        Return valid JSON only.`,
      },
      {
        role: 'user',
        content: `Create a biology mission based on: "${prompt}"

        Return JSON with this exact structure:
        {
          "title": "Mission title",
          "description": "One sentence hook",
          "storyline": "2-3 paragraph engaging story setup",
          "evidence": [
            {"title": "Evidence item name", "description": "What this evidence shows", "content": "Detailed evidence data/text", "type": "text|image|data|chart"}
          ],
          "questions": [
            {"question_text": "Question", "question_type": "multiple_choice|open_ended|hypothesis", "options": ["A", "B", "C", "D"], "hint": "Socratic hint"}
          ],
          "conclusion_guide": "What a good conclusion should include"
        }`,
      },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content ?? '{}')
}
