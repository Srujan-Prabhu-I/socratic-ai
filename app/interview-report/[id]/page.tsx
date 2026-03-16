'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function InterviewReportPage() {
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      if (!auth) { router.push('/auth'); return }
      loadData(sessionId)
    })
  }, [sessionId])

  const loadData = async (id: string) => {
    const { data: s } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (!s) { router.push('/dashboard'); return }
    setSession(s)
    const { data: msgs } = await supabase.from('messages').select('*').eq('session_id', id).order('created_at', { ascending: true })
    setMessages(msgs || [])
    setLoading(false)
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const company = session.problem_title?.split(' Interview')[0] || 'FAANG'
      const res = await fetch('/api/interview-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          company,
          problemTitle: session.problem_title,
          timeUsed: 45,
          hintsUsed: 0,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data.report)
    } catch (e: any) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{score}/10</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 10}%`, background: score >= 8 ? '#34d399' : score >= 6 ? '#f59e0b' : '#ef4444', borderRadius: '2px', transition: 'width 1s ease' }} />
      </div>
    </div>
  )

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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push(`/session/${sessionId}`)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back to session</button>
          {report && <button onClick={() => window.print()} style={{ background: '#fff', border: 'none', color: '#000', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Download Report</button>}
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>
        {!report ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎤</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>Interview Report Card</h1>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Session: <span style={{ color: '#e5e5e5' }}>{session.problem_title}</span></p>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '40px' }}>{messages.length} exchanges completed</p>
            <button onClick={generateReport} disabled={generating} style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: generating ? 0.5 : 1 }}>
              {generating ? 'Analyzing interview...' : 'Generate Report Card →'}
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Interview Report Card</div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>{session.problem_title}</h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: report.wouldHire ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${report.wouldHire ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '100px', padding: '6px 20px', marginTop: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: report.wouldHire ? '#34d399' : '#ef4444' }}>{report.recommendation}</span>
              </div>
            </div>

            {/* Overall score */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px' }}>
              {[
                { label: 'Overall', value: `${report.overallScore}%` },
                { label: 'Technical', value: `${report.technicalScore}/10` },
                { label: 'Communication', value: `${report.communicationScore}/10` },
                { label: 'Problem Solving', value: `${report.problemSolvingScore}/10` },
              ].map((item, i) => (
                <div key={i} style={{ background: '#0d0d0d', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{item.value}</div>
                  <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Score bars */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '20px' }}>Performance Breakdown</div>
              <ScoreBar label="Technical Accuracy" score={report.technicalScore} />
              <ScoreBar label="Communication" score={report.communicationScore} />
              <ScoreBar label="Problem Solving" score={report.problemSolvingScore} />
              <ScoreBar label="Time Management" score={report.timeManagementScore} />
            </div>

            {/* Feedback */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Interviewer Feedback</div>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.7 }}>{report.detailedFeedback}</p>
            </div>

            {/* Strengths + Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Strengths</div>
                {report.strengths?.map((s: string, i: number) => (
                  <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(52,211,153,0.3)' }}>✓ {s}</p>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Improve On</div>
                {report.improvements?.map((s: string, i: number) => (
                  <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(245,158,11,0.3)' }}>→ {s}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
