'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

const DIFF_COLORS: Record<string, string> = {
  Easy: '#34d399',
  Medium: '#f59e0b',
  Hard: '#ef4444',
}

export default function VariantsPage() {
  const [session, setSession] = useState<any>(null)
  const [variants, setVariants] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      if (!auth) { router.push('/auth'); return }
      setUser(auth.user)
      loadSession()
    })
  }, [])

  const loadSession = async () => {
    const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (!data) { router.push('/dashboard'); return }
    setSession(data)
    setLoading(false)
  }

  const generateVariants = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: session.problem_title || session.topic,
          topic: session.topic,
          difficulty: session.difficulty || 'intermediate',
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVariants(data)
    } catch (e: any) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const startVariant = async (variant: any) => {
    if (!user) return
    const { data } = await supabase.from('sessions').insert({
      user_id: user.id,
      mode: 'review',
      status: 'active',
      difficulty: session.difficulty || 'intermediate',
      problem_title: variant.title,
      problem_description: variant.description,
      language: session.language || 'javascript',
    }).select().single()
    if (data) router.push(`/session/${data.id}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <span style={{ color: '#555' }}>Loading...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.95)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}>
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
        <button onClick={() => router.push(`/session/${sessionId}`)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back</button>
      </nav>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 40px 60px', position: 'relative', zIndex: 5 }}>

        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '12px' }}>Similar Problems</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>
            You solved <span style={{ color: '#e5e5e5' }}>{session?.problem_title}</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#555' }}>Here are 3 related problems to deepen your understanding of the same concept.</p>
        </div>

        {!variants ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🧩</div>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '32px' }}>AI will generate 3 problems that build on what you just learned.</p>
            <button
              onClick={generateVariants}
              disabled={generating}
              style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: generating ? 0.5 : 1 }}
            >
              {generating ? 'Generating variants...' : 'Generate Similar Problems →'}
            </button>
          </div>
        ) : (
          <div>
            {/* Concept cluster */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Concept Cluster</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e5e5e5' }}>{variants.conceptCluster}</div>
              </div>
              <div style={{ fontSize: '24px' }}>🧠</div>
            </div>

            {/* Variant cards */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginBottom: '32px' }}>
              {variants.variants?.map((v: any, i: number) => (
                <div
                  key={i}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{v.title}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: DIFF_COLORS[v.difficulty], border: `1px solid ${DIFF_COLORS[v.difficulty]}33`, padding: '2px 8px', borderRadius: '100px' }}>{v.difficulty}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#444', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '100px' }}>{v.topic}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#555', fontStyle: 'italic', maxWidth: '180px', textAlign: 'right' as const }}>{v.whyRelated}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '12px' }}>{v.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#f59e0b' }}>💡 {v.hint}</span>
                    <button
                      onClick={() => startVariant(v)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                    >
                      Solve this →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mastery tip */}
            <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Mastery Tip</div>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7 }}>{variants.masteryTip}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
