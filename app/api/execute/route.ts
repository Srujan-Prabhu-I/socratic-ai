import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json()

    const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
      javascript: { language: 'javascript', version: '18.15.0' },
      typescript: { language: 'typescript', version: '5.0.3' },
      python: { language: 'python', version: '3.10.0' },
      java: { language: 'java', version: '15.0.2' },
      cpp: { language: 'c++', version: '10.2.0' },
      c: { language: 'c', version: '10.2.0' },
    }

    const lang = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript

    const startTime = Date.now()

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.language,
        version: lang.version,
        files: [{ content: code }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    })

    const data = await response.json()
    const timeMs = Date.now() - startTime

    if (!response.ok) throw new Error('Execution failed')

    const output = data.run?.output || data.compile?.output || data.run?.stderr || data.compile?.stderr || 'No output produced'
    const stderr = data.run?.stderr || data.compile?.stderr || ''
    const isError = data.run?.code !== 0 || !!data.compile?.stderr

    return NextResponse.json({
      output: output || stderr || 'No output',
      stderr,
      isError,
      timeMs,
      exitCode: data.run?.code || 0,
      language: lang.language,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
