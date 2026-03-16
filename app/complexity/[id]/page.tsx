'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function ComplexityPage() {
  const [session, setSession] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [animating, setAnimating] = useState(false)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      if (!auth) { router.push('/auth'); return }
      loadSession()
    })
  }, [])

  const loadSession = async () => {
    const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (!data) { router.push('/dashboard'); return }
    setSession(data)
    setLoading(false)
  }

  const analyze = async () => {
    if (!session?.original_code) return
    setGenerating(true)
    try {
      const res = await fetch('/api/analyze-complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: session.original_code,
          language: session.language || 'javascript',
          problemTitle: session.problem_title,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data.analysis)
      setTimeout(() => setAnimating(true), 100)
    } catch (e: any) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <span style={{ color: '#555' }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <svg width="32" height="32" viewBox="0 0 44 44">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>SocraticAI</span>
        </div>
        <button onClick={() => router.push(`/session/${sessionId}`)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back to session</button>
      </nav>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 40px' }}>
        {!analysis ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>📊</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>Complexity Analyzer</h1>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '40px' }}>AI will analyze your code and show exactly where the bottleneck is with a visual comparison.</p>

            {session?.original_code ? (
              <button onClick={analyze} disabled={generating} style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: generating ? 0.5 : 1 }}>
                {generating ? 'Analyzing complexity...' : 'Analyze My Code →'}
              </button>
            ) : (
              <p style={{ color: '#555' }}>No code found for this session. Use Code Review mode to analyze complexity.</p>
            )}
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Complexity Analysis</div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>{session.problem_title}</h1>
            </div>

            {/* Current vs Optimal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Your Solution</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{analysis.currentTimeComplexity}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>Space: {analysis.currentSpaceComplexity}</div>
              </div>
              <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '10px', color: '#34d399', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Optimal Solution</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{analysis.optimalTimeComplexity}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>Space: {analysis.optimalSpaceComplexity}</div>
              </div>
            </div>

            {/* Visual complexity chart */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '24px' }}>Complexity Scale</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {analysis.complexityLevels?.map((level: any, i: number) => {
                  const isCurrent = level.label === analysis.currentTimeComplexity
                  const isOptimal = level.label === analysis.optimalTimeComplexity
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '80px', fontSize: '12px', fontWeight: isCurrent || isOptimal ? 700 : 400, color: isCurrent ? '#ef4444' : isOptimal ? '#34d399' : '#555', textAlign: 'right' as const, flexShrink: 0 }}>{level.label}</div>
                      <div style={{ flex: 1, height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                          height: '100%',
                          width: animating ? `${level.score}%` : '0%',
                          background: isCurrent ? 'rgba(239,68,68,0.4)' : isOptimal ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.06)',
                          borderRadius: '4px',
                          transition: `width 1s ease ${i * 0.1}s`,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '10px',
                        }}>
                          {(isCurrent || isOptimal) && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: isCurrent ? '#ef4444' : '#34d399', whiteSpace: 'nowrap' as const }}>
                              {isCurrent ? '← YOUR CODE' : '← OPTIMAL'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ width: '100px', fontSize: '11px', color: '#333', flexShrink: 0 }}>{level.description}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottleneck */}
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#ef4444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Bottleneck Detected</div>
              <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6 }}>{analysis.bottleneck}</p>
            </div>

            {/* Explanation */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Explanation</div>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7 }}>{analysis.explanation}</p>
            </div>

            {/* Optimized code */}
            <div style={{ background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', color: '#34d399', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Optimized Solution</div>
              <pre style={{ fontSize: '12px', color: '#888', lineHeight: 1.7, fontFamily: 'monospace', overflowX: 'auto' as const }}>
                {analysis.improvedCode}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => router.push(`/certificate/${sessionId}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 28px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                🏆 Get Certificate
              </button>
              <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '12px 24px', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
