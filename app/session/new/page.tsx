'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const TOPICS = ['Arrays','Linked Lists','Stacks & Queues','Trees','Graphs','Dynamic Programming','Sorting','Binary Search','Recursion','Hashing','Heaps','Tries','Sliding Window','Two Pointers','Backtracking']
const LANGUAGES = ['javascript','typescript','python','java','cpp','c']

function SessionNewContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'ask'

  const [question, setQuestion] = useState('')
  const [problemTitle, setProblemTitle] = useState('')
  const [editorCode, setEditorCode] = useState(
`console.log("Hello from SocraticAI")
console.log("Run Code Working")`
)
  const [language, setLanguage] = useState('javascript')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth')
      else setUser(session.user)
    })
  }, [])

  const runCode = async () => {
  try {
    setIsRunning(true)

    const logs: string[] = []

    const originalLog = console.log

    console.log = (...args: any[]) => {
      logs.push(args.join(" "))
      originalLog(...args)
    }

    try {
      eval(editorCode)
    } catch (error: any) {
      setOutput(error.toString())
      console.log = originalLog
      setIsRunning(false)
      return
    }

    console.log = originalLog

    if (logs.length > 0) {
      setOutput(logs.join("\n"))
    } else {
      setOutput("Program executed successfully with no output.")
    }

  } catch (error: any) {
    setOutput("Execution failed")
  }

  setIsRunning(false)
}

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const insertData: any = {
        user_id: user.id,
        mode,
        status: 'active',
        difficulty,
        language: mode === 'review' ? language : null,
      }
      if (mode === 'ask') {
        if (!question.trim()) { setError('Please enter a question'); setLoading(false); return }
        insertData.problem_title = question
        insertData.problem_description = question
      } else if (mode === 'review') {
        if (!problemTitle.trim() || !editorCode.trim()) { setError('Please fill all fields'); setLoading(false); return }
        insertData.problem_title = problemTitle
        insertData.original_code = editorCode
      } else if (mode === 'learn') {
        if (!selectedTopic) { setError('Please select a topic'); setLoading(false); return }
        insertData.problem_title = selectedTopic
        insertData.topic = selectedTopic
      }

      const { data: session, error: err } = await supabase.from('sessions').insert(insertData).select().single()
      if (err) throw err
      router.push(`/session/${session.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const modeConfig: Record<string, { title: string; subtitle: string }> = {
    ask: { title: 'Ask & Learn', subtitle: 'Ask any DSA question — the AI will guide your understanding' },
    review: { title: 'Code Review', subtitle: 'Paste your code and find the bug yourself through guided questions' },
    learn: { title: 'Learn a Topic', subtitle: 'Pick a topic and get a personalized Socratic learning session' },
  }
  const cfg = modeConfig[mode] || modeConfig.ask

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
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
        <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </nav>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 40px 60px', position: 'relative', zIndex: 5 }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#555', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '100px', display: 'inline-block', marginBottom: '16px' }}>{cfg.title}</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>{cfg.title}</h1>
          <p style={{ fontSize: '13px', color: '#555' }}>{cfg.subtitle}</p>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '10px' }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { val: 'beginner', label: '🌱 Beginner' },
              { val: 'intermediate', label: '⚡ Intermediate' },
              { val: 'pro', label: '🔥 Pro' },
            ].map(d => (
              <button key={d.val} onClick={() => setDifficulty(d.val)} style={{ flex: 1, background: difficulty === d.val ? 'rgba(255,255,255,0.08)' : 'transparent', border: `1px solid ${difficulty === d.val ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, color: difficulty === d.val ? '#fff' : '#555', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: difficulty === d.val ? 600 : 400, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* ASK MODE */}
        {mode === 'ask' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '8px' }}>Your Question</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. How does binary search work? Why is my two-pointer approach wrong?"
              rows={5}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', color: '#fff', fontSize: '14px', resize: 'none', fontFamily: 'Inter,sans-serif', outline: 'none', lineHeight: 1.6 }}
            />
          </div>
        )}

        {/* REVIEW MODE */}
        {mode === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '8px' }}>Problem Name</label>
              <input value={problemTitle} onChange={e => setProblemTitle(e.target.value)} placeholder="e.g. Two Sum, Binary Search..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const }}>Your Code</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#999', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Editor
height="300px"
language="javascript"
theme="vs-dark"
value={editorCode}
onChange={(value) => setEditorCode(value || "")}
/>
              </div>
              <div style={{marginTop:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <label style={{fontSize:'11px',color:'#444',letterSpacing:'1px',textTransform:'uppercase' as const}}>Output</label>
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    style={{background: isRunning ? 'rgba(255,255,255,0.05)' : '#10b981', border: 'none', color: '#000', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: isRunning ? 0.5 : 1}}
                  >
                    {isRunning ? 'Running...' : '▶ Run Code'}
                  </button>
                </div>
                {output && (
                  <div style={{marginTop:'8px', background:'#000', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px', fontFamily:'monospace', fontSize:'12px', color:'#4ade80', whiteSpace:'pre-wrap', lineHeight:1.5}}>
                    {output}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LEARN MODE */}
        {mode === 'learn' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const, display: 'block', marginBottom: '12px' }}>Choose a Topic</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {TOPICS.map(t => (
                <button key={t} onClick={() => setSelectedTopic(t)} style={{ background: selectedTopic === t ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedTopic === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '10px 12px', color: selectedTopic === t ? '#fff' : '#555', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', textAlign: 'left' as const, transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Starting session...' : 'Start Session →'}
        </button>
      </main>
    </div>
  )
}

export default function SessionNewPage() {
  return (
    <Suspense fallback={
      <div style={{background:'#000', minHeight:'100vh', 
      display:'flex', alignItems:'center', 
      justifyContent:'center', color:'white', 
      fontSize:'14px'}}>
        Loading...
      </div>
    }>
      <SessionNewContent />
    </Suspense>
  )
}