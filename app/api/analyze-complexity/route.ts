import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { code, language, problemTitle } = await req.json()

    const prompt = `Analyze this ${language} code for time and space complexity.

PROBLEM: ${problemTitle}
CODE:
${code}

Respond with ONLY this JSON (no markdown):
{
  "currentTimeComplexity": "O(n²)",
  "currentSpaceComplexity": "O(1)",
  "optimalTimeComplexity": "O(n)",
  "optimalSpaceComplexity": "O(n)",
  "currentScore": 35,
  "optimalScore": 95,
  "bottleneck": "Nested loop on lines 3-7 causes quadratic time",
  "explanation": "Your nested loop checks every pair, resulting in n² operations. The optimal approach uses a HashSet for O(1) lookups.",
  "improvedCode": "// Optimized version\\nfunction solution(nums) {\\n  const seen = new Set()\\n  for (const n of nums) {\\n    if (seen.has(n)) return n\\n    seen.add(n)\\n  }\\n}",
  "complexityLevels": [
    {"label": "O(1)", "score": 100, "description": "Constant"},
    {"label": "O(log n)", "score": 90, "description": "Logarithmic"},
    {"label": "O(n)", "score": 80, "description": "Linear"},
    {"label": "O(n log n)", "score": 65, "description": "Linearithmic"},
    {"label": "O(n²)", "score": 35, "description": "Quadratic"},
    {"label": "O(2ⁿ)", "score": 10, "description": "Exponential"}
  ]
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
        temperature: 0.1,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error')
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(clean)
    return NextResponse.json({ analysis })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
