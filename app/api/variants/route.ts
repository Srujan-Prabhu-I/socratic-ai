import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, topic, difficulty } = await req.json()

    const prompt = `You are a DSA problem curator. Given that a student just solved "${problemTitle}", generate 3 related practice problems that build on the same concept.

Respond with ONLY this JSON (no markdown):
{
  "variants": [
    {
      "title": "Two Sum II",
      "difficulty": "Easy",
      "topic": "Arrays",
      "description": "Given a sorted array, find two numbers that add up to target. Can you do better than O(n²)?",
      "hint": "The array being sorted is a big clue",
      "whyRelated": "Same concept, adds constraint of sorted input"
    },
    {
      "title": "Three Sum",
      "difficulty": "Medium", 
      "topic": "Arrays",
      "description": "Find all unique triplets that sum to zero.",
      "hint": "Can you reduce it to Two Sum?",
      "whyRelated": "Extends Two Sum to three elements"
    },
    {
      "title": "Four Sum",
      "difficulty": "Hard",
      "topic": "Arrays", 
      "description": "Find all quadruplets that sum to target.",
      "hint": "Think recursively — can you reduce to Three Sum?",
      "whyRelated": "Natural progression from Two Sum and Three Sum"
    }
  ],
  "conceptCluster": "Array + HashSet patterns",
  "masteryTip": "Once you master Two Sum variants, HashMap lookups become instinctive for O(n) solutions"
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
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error')
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
