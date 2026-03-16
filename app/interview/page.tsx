'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const COMPANIES = [
  { name: 'Amazon', icon: '📦', focus: 'Leadership principles + DSA', color: '#f59e0b' },
  { name: 'Google', icon: '🔍', focus: 'Algorithms + system design', color: '#3b82f6' },
  { name: 'Microsoft', icon: '🪟', focus: 'Problem solving + OOP', color: '#6366f1' },
  { name: 'Meta', icon: '👤', focus: 'Scalability + optimization', color: '#8b5cf6' },
  { name: 'Genpact', icon: '💼', focus: 'Data structures + logic', color: '#10b981' },
  { name: 'TCS', icon: '🏢', focus: 'Core DSA + fundamentals', color: '#64748b' },
]

const INTERVIEW_PROBLEMS = [
  'Two Sum', 'Reverse a Linked List', 'Binary Search', 'Valid Parentheses',
  'Maximum Subarray', 'Number of Islands', 'LRU Cache', 'Merge Intervals',
  'Climbing Stairs', 'Word Search',
]

export default function InterviewPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedProblem, setSelectedProblem] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
    })
  }, [])

  const startInterview = async () => {
    if (!selectedCompany) return
    setLoading(true)
    try {
      const problem = selectedProblem || INTERVIEW_PROBLEMS[Math.floor(Math.random() * INTERVIEW_PROBLEMS.length)]
      const { data, error } = await supabase.from('sessions').insert({
        user_id: user.id,
        mode: 'interview',
        status: 'active',
        problem_title: `${selectedCompany} Interview — ${problem}`,
        problem_description: problem,
        difficulty,
        language: 'javascript',
      }).select().single()
      if (error) throw error
      router.push(`/session/${data.id}`)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <svg width="32" height="32" viewBox="0 0 44 44">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.4px' }}>SocraticAI</span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '100px 40px 60px', position: 'relative', zIndex: 5 }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#555', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '100px', display: 'inline-block', marginBottom: '16px' }}>Interview Simulator</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Mock Interview</h1>
          <p style={{ fontSize: '13px', color: '#555' }}>AI plays a real interviewer from top companies. Get graded on communication + technical accuracy.</p>
        </div>

        {/* Company selector */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '12px' }}>Choose Company</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {COMPANIES.map(c => (
              <div
                key={c.name}
                onClick={() => setSelectedCompany(c.name)}
                style={{ background: selectedCompany === c.name ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedCompany === c.name ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}
              >
                {selectedCompany === c.name && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${c.color},transparent)` }} />}
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>{c.name}</div>
                <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.5 }}>{c.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem selector */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '12px' }}>Problem <span style={{ color: '#333', fontWeight: 400, textTransform: 'none' as const }}>(optional — leave blank for random)</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px' }}>
            {INTERVIEW_PROBLEMS.map(p => (
              <button key={p} onClick={() => setSelectedProblem(selectedProblem === p ? '' : p)} style={{ background: selectedProblem === p ? 'rgba(255,255,255,0.06)' : 'transparent', border: `1px solid ${selectedProblem === p ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px', padding: '10px 14px', color: selectedProblem === p ? '#fff' : '#555', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', textAlign: 'left' as const, transition: 'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '10px' }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ val: 'beginner', label: '🌱 Beginner' }, { val: 'intermediate', label: '⚡ Intermediate' }, { val: 'pro', label: '🔥 Pro' }].map(d => (
              <button key={d.val} onClick={() => setDifficulty(d.val)} style={{ flex: 1, background: difficulty === d.val ? 'rgba(255,255,255,0.08)' : 'transparent', border: `1px solid ${difficulty === d.val ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, color: difficulty === d.val ? '#fff' : '#555', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: difficulty === d.val ? 600 : 400, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startInterview}
          disabled={loading || !selectedCompany}
          style={{ width: '100%', background: selectedCompany ? '#fff' : 'rgba(255,255,255,0.05)', color: selectedCompany ? '#000' : '#333', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: selectedCompany ? 'pointer' : 'not-allowed', fontFamily: 'Inter,sans-serif', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }}
        >
          {loading ? 'Starting interview...' : selectedCompany ? `Start ${selectedCompany} Interview →` : 'Select a company first'}
        </button>
      </main>
    </div>
  )
}
