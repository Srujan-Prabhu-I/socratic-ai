import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { messages, company, problemTitle, timeUsed, hintsUsed } = await req.json()

    const conversation = messages.map((m: any) =>
      `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}` 
    ).join('\n\n')

    const prompt = `You are evaluating a mock ${company} technical interview.

PROBLEM: ${problemTitle}
TIME USED: ${timeUsed} minutes out of 45
HINTS USED: ${hintsUsed}

CONVERSATION:
${conversation}

Generate a detailed interview report card as JSON (no markdown, pure JSON):
{
  "overallScore": 78,
  "recommendation": "Strong Hire / Hire / No Hire",
  "technicalScore": 8,
  "communicationScore": 7,
  "problemSolvingScore": 8,
  "timeManagementScore": 9,
  "strengths": ["clear explanation of approach", "identified edge cases"],
  "improvements": ["could optimize space complexity", "explain time complexity upfront"],
  "detailedFeedback": "2-3 sentence overall assessment",
  "wouldHire": true
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
    const report = JSON.parse(clean)
    return NextResponse.json({ report })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
