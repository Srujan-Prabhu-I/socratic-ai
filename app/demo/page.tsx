'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TLE_CODE = `// Current solution - gets Time Limit Exceeded!
// Time Complexity: O(n²) - TOO SLOW for large inputs

function findDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) {
        return nums[i];
      }
    }
  }
}`

export default function DemoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth?redirect=/demo')
        return
      }
      setUser(session.user)
    })
  }, [])

  const startDemo = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('sessions').insert({
        user_id: user.id,
        mode: 'review',
        status: 'active',
        difficulty: 'intermediate',
        problem_title: 'Fix TLE: Find Duplicate in Array',
        problem_description: `Given an array of n+1 integers where each integer is between 1 and n inclusive, find the duplicate number. Your current O(n²) nested loop solution gets Time Limit Exceeded on large inputs. Optimize it.`,
        original_code: TLE_CODE,
        language: 'javascript',
      }).select().single()
      if (error) throw error
      router.push(`/session/${data.id}`)
    } catch (err: any) {
      console.error(err)
      setLoading(false)
    }
  }

  const steps = [
    { icon: '⏱️', title: 'TLE Error', desc: 'Student has O(n²) nested loop solution that times out' },
    { icon: '🤔', title: 'Question 1', desc: 'AI asks: "What is the time complexity of your current solution?"' },
    { icon: '💡', title: 'Question 2', desc: 'AI asks: "What data structure gives O(1) lookup time?"' },
    { icon: '🔍', title: 'Question 3', desc: 'AI asks: "How could a HashSet help detect duplicates in one pass?"' },
    { icon: '⚡', title: 'Question 4', desc: 'AI asks: "Can you rewrite using that approach?"' },
    { icon: '✅', title: 'Optimized!', desc: 'Student reaches O(n) solution with O(n) space — TLE fixed!' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />

      {/* Nav */}
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

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 40px 60px', position: 'relative', zIndex: 5 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, letterSpacing: '1px' }}>LIVE DEMO</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '12px' }}>TLE → Optimized</h1>
          <p style={{ fontSize: '14px', color: '#555', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Watch SocraticAI guide a student from a Time Limit Exceeded O(n²) solution to an optimized O(n) solution — in under 5 questions.
          </p>
        </div>

        {/* Flow visualization */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase' as const }}>The journey</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ background: '#080808', padding: '20px', position: 'relative' }}>
                {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#ef4444,transparent)' }} />}
                {i === steps.length - 1 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#34d399,transparent)' }} />}
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e5e5e5', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code preview */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Starting code (TLE)</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '10px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '100px' }}>O(n²) — Too Slow</span>
          </div>
          <pre style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', fontSize: '12px', color: '#888', lineHeight: 1.7, overflowX: 'auto' as const, fontFamily: 'monospace' }}>
            {TLE_CODE}
          </pre>
        </div>

        {/* Expected output */}
        <div style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#34d399', letterSpacing: '1.5px', marginBottom: '12px', textTransform: 'uppercase' as const }}>Target Solution (AI will guide to this)</div>
          <pre style={{ fontSize: '12px', color: '#555', lineHeight: 1.7, fontFamily: 'monospace' }}>
{`// Optimized O(n) solution using HashSet
function findDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return num;
    seen.add(num);
  }
}`}
          </pre>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={startDemo}
            disabled={loading || !user}
            style={{ background: '#fff', color: '#000', border: 'none', padding: '16px 48px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: loading ? 0.5 : 1, marginBottom: '16px', display: 'block', width: '100%' }}
          >
            {loading ? 'Starting demo...' : '🚀 Start Live Demo — TLE to Optimized'}
          </button>
          <p style={{ fontSize: '12px', color: '#333' }}>This will open a real Socratic session with the TLE code pre-loaded</p>
        </div>
      </main>
    </div>
  )
}
