import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        language_id: 63,
        source_code: code
      })
    })

    const data = await response.json()

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Execution failed" }, { status: 500 })
  }
}
