'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function CertificatePage() {
  const [session, setSession] = useState<any>(null)
  const [certificate, setCertificate] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
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

  const generateCertificate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: session.problem_title || session.topic,
          mode: session.mode,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          questionCount: messages.filter((m: any) => m.role === 'assistant').length,
          language: session.language,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCertificate(data.certificate)
    } catch (e: any) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <span style={{ color: '#555', fontSize: '14px' }}>Loading session...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <style>{`@media print { .no-print { display: none !important; } .print-area { background: white !important; color: black !important; } }`}</style>

      {/* Nav */}
      <nav className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,8,8,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <svg width="32" height="32" viewBox="0 0 44 44">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.4px' }}>SocraticAI</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push(`/session/${sessionId}`)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back to session</button>
          {certificate && <button onClick={handlePrint} style={{ background: '#fff', border: 'none', color: '#000', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Download PDF</button>}
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>
        {!certificate ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🏆</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>Proof of Understanding</h1>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Session: <span style={{ color: '#e5e5e5' }}>{session.problem_title || session.topic}</span></p>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '40px' }}>Messages: <span style={{ color: '#e5e5e5' }}>{messages.length}</span> exchanges</p>
            <button
              onClick={generateCertificate}
              disabled={generating}
              style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: generating ? 0.5 : 1 }}
            >
              {generating ? 'Analyzing your session...' : 'Generate Certificate →'}
            </button>
            {generating && <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>AI is analyzing your reasoning path...</p>}
          </div>
        ) : (
          <div className="print-area">
            {/* Certificate header */}
            <div style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                <svg width="40" height="40" viewBox="0 0 44 44">
                  <defs><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
                  <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#lg2)" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
                  <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
                </svg>
                <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>SocraticAI</span>
              </div>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Certificate of Understanding</div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-2px', marginBottom: '8px' }}>{session.problem_title || session.topic}</h1>
              <p style={{ fontSize: '13px', color: '#555' }}>{new Date(session.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Score */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px' }}>
              {[
                { label: 'Score', value: `${certificate.score}%` },
                { label: 'Grade', value: certificate.grade },
                { label: 'Questions Used', value: `${Math.min(messages.filter((m:any) => m.role === 'assistant').length, 5)} of 5` },
              ].map((item, i) => (
                <div key={i} style={{ background: '#0d0d0d', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: '6px' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Summary</div>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.7 }}>{certificate.summary}</p>
            </div>

            {/* Concepts mastered */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Concepts Demonstrated</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {certificate.conceptsmastered?.map((c: string, i: number) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', color: '#e5e5e5' }}>✓ {c}</span>
                ))}
              </div>
            </div>

            {/* Reasoning path */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Reasoning Path</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {certificate.reasoningpath?.map((step: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#666', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginTop: '3px' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths + Improvement */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Strengths</div>
                {certificate.strengths?.map((s: string, i: number) => (
                  <p key={i} style={{ fontSize: '13px', color: '#888', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>{s}</p>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>Area to Improve</div>
                <p style={{ fontSize: '13px', color: '#888', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>{certificate.improvement}</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '11px', color: '#333', letterSpacing: '1px' }}>Generated by SocraticAI · This certificate verifies independent reasoning, not answer copying</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
