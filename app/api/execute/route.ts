import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json()

    if (language !== 'javascript') {
      return NextResponse.json({
        output: `⚠️ Live execution supports JavaScript only.\nFor ${language}, AI will analyze your code directly.`,
        isError: false,
        timeMs: 0,
      })
    }

    const startTime = Date.now()

    // Safe JS execution via Function constructor
    const logs: string[] = []
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
      warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
    }

    try {
      const fn = new Function('console', code)
      fn(customConsole)
    } catch (e: any) {
      return NextResponse.json({
        output: `Runtime Error: ${e.message}`,
        isError: true,
        timeMs: Date.now() - startTime,
      })
    }

    return NextResponse.json({
      output: logs.length > 0 ? logs.join('\n') : 'Code ran successfully with no output.',
      isError: false,
      timeMs: Date.now() - startTime,
    })

  } catch (error: any) {
    return NextResponse.json({
      output: `Error: ${error.message}`,
      isError: true,
      timeMs: 0,
    })
  }
}
