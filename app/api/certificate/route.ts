import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, mode, messages, questionCount, language, difficulty } = await req.json()

    const conversation = messages.map((m: any) => 
      `${m.role === 'assistant' ? 'AI' : 'Student'}: ${m.content}` 
    ).join('\n\n')

    const prompt = `Analyze this Socratic learning session and generate a certificate of understanding.

PROBLEM/TOPIC: ${problemTitle}
MODE: ${mode}
LANGUAGE: ${language || 'N/A'}
DIFFICULTY: ${difficulty || 'intermediate'}
QUESTIONS USED: ${questionCount} of 5

CONVERSATION:
${conversation}

SCORING RULES — base score on QUALITY OF ANSWERS, not just question count:
- Read each student response carefully
- If student gave CORRECT, INSIGHTFUL answers → score 85-100 regardless of questions used
- If student gave MOSTLY CORRECT answers with minor gaps → score 70-84
- If student needed lots of hints and guidance → score 55-69
- If student struggled significantly → score 40-54
- Questions used is a MINOR factor — a student who answered all 5 correctly deserves 90%+
- A student who gave up early deserves lower score

Generate a JSON certificate with exactly this structure (no markdown, pure JSON):
{
  "conceptsmastered": ["concept1", "concept2", "concept3"],
  "reasoningpath": ["step1 of their thinking", "step2", "step3"],
  "strengths": ["strength1", "strength2"],
  "improvement": "one specific area to improve",
  "score": 85,
  "grade": "A",
  "summary": "2 sentence summary focusing on WHAT the student demonstrated, not how many questions it took"
}`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error')
    
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const certificate = JSON.parse(clean)
    
    return NextResponse.json({ certificate })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
