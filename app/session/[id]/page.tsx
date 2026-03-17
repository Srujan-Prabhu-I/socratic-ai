'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

const MODE_LABELS: Record<string, string> = {
  ask: 'Ask & Learn',
  review: 'Code Review',
  learn: 'Learn a Topic',
  interview: 'Interview',
}

const MODE_COLORS: Record<string, string> = {
  ask: '#3b82f6',
  review: '#8b5cf6',
  learn: '#10b981',
  interview: '#f59e0b',
}

export default function SessionPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [initializing, setInitializing] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [runOutput, setRunOutput] = useState('')
  const [runError, setRunError] = useState(false)
  const [runLoading, setRunLoading] = useState(false)
  const [showRunner, setShowRunner] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      if (!auth) { router.push('/auth'); return }
      setUser(auth.user)
      loadSession(sessionId)
    })
  }, [sessionId])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (session?.mode !== 'interview') return
    setTimerActive(true)
  }, [session])

  useEffect(() => {
    if (!timerActive || session?.mode !== 'interview') return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(interval); setTimerActive(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, session])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const loadSession = async (id: string) => {
    const { data } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (!data) { router.push('/dashboard'); return }
    setSession(data)
    if (data.status === 'completed' || data.status === 'learned') setSessionComplete(true)
    const { data: msgs } = await supabase.from('messages').select('*').eq('session_id', id).order('created_at', { ascending: true })
    if (msgs && msgs.length > 0) {
      setMessages(msgs.map(m => ({ role: m.role, content: m.content })))
      setQuestionCount(msgs.filter(m => m.role === 'assistant').length)
      setInitializing(false)
    } else {
      await startSession(data)
    }
  }

  const startSession = async (s: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          mode: s.mode,
          questionCount: 0,
          problemTitle: s.problem_title,
          originalCode: s.original_code,
          language: s.language,
          topic: s.topic,
          difficulty: s.difficulty,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages([aiMsg])
      setQuestionCount(1)
      await supabase.from('messages').insert({ session_id: s.id, role: 'assistant', content: data.message })
    } catch (e) { console.error(e) }
    finally { setLoading(false); setInitializing(false) }
  }

  const handleTeachMe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: '[STUDENT_GAVE_UP] Please explain the complete solution now.' }],
          mode: session.mode,
          questionCount,
          problemTitle: session.problem_title,
          originalCode: session.original_code,
          language: session.language,
          topic: session.topic,
          difficulty: session.difficulty,
          forceExplain: true,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, aiMsg])
      setQuestionCount(prev => prev + 1)
      await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: data.message })
      await supabase.from('sessions').update({ status: 'learned' }).eq('id', sessionId)
      setSessionComplete(true)
      await awardXP()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const awardXP = async () => {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    if (!authSession?.user) return
    const userId = authSession.user.id
    const xpEarned = Math.max(100 - (questionCount * 10), 50)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const { data: prog } = await supabase.from('progress').select('*').eq('user_id', userId).single()
    if (prog) {
      const lastDate = prog.last_session_date
      const newStreak = lastDate === yesterday ? (prog.streak || 0) + 1 : lastDate === today ? prog.streak || 1 : 1
      const newXP = (prog.xp || 0) + xpEarned
      const newBadges = [...(prog.badges || [])]
      if (newXP >= 500 && !newBadges.includes('xp_500')) newBadges.push('xp_500')
      if (newStreak >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3')
      if ((prog.problems_solved || 0) + 1 >= 5 && !newBadges.includes('problems_5')) newBadges.push('problems_5')
      await supabase.from('progress').update({
        xp: newXP, streak: newStreak, last_session_date: today,
        problems_solved: (prog.problems_solved || 0) + 1,
        total_sessions: (prog.total_sessions || 0) + 1,
        badges: newBadges,
      }).eq('user_id', userId)
    } else {
      await supabase.from('progress').insert({
        user_id: userId, xp: xpEarned, streak: 1,
        last_session_date: today, problems_solved: 1, total_sessions: 1, badges: [],
      })
    }
  }

  // Detect if AI response indicates session should complete
  const detectSessionComplete = (aiResponse: string): boolean => {
    const completionSignals = [
      "you've got it",
      "exactly right",
      "that's correct",
      "you found it",
      "perfect understanding",
      "well done",
      "you've solved it",
      "that's the solution",
      "correct approach",
      "here's the complete solution",
      "let me walk you through",
      "here's what was happening",
    ]
    const lower = aiResponse.toLowerCase()
    return completionSignals.some(signal => lower.includes(signal))
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    await supabase.from('messages').insert({ session_id: sessionId, role: 'user', content: input })
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          mode: session.mode,
          questionCount,
          problemTitle: session.problem_title,
          originalCode: session.original_code,
          language: session.language,
          topic: session.topic,
          difficulty: session.difficulty,
          company: session.problem_title?.split(' Interview')[0],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, aiMsg])
      const newCount = questionCount + 1
      setQuestionCount(newCount)
      await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: data.message })

      // Adaptive completion — detect if AI gave solution OR hard limit of 8
      const isComplete = detectSessionComplete(data.message) || newCount >= 8
      if (isComplete && !sessionComplete) {
        setSessionComplete(true)
        await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
        await awardXP()
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const renderContent = (content: string) => content.split('```').map((part, i) =>
    i % 2 === 1
      ? <div key={i} style={{ position: 'relative', margin: '8px 0' }}>
          <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: '4px' }}>code</div>
          <pre style={{ background: '#000000', border: '1px solid #2c2c2e', borderRadius: '10px', padding: '12px 16px', margin: '0', overflowX: 'auto', fontSize: '13px', color: '#fff', fontFamily: "'SF Mono', monospace", lineHeight: 1.6 }}>{part.replace(/^[a-z]+\n/, '')}</pre>
        </div>
      : <span key={i}>{part}</span>
  )

  const executeCode = async () => {
    if (!session?.original_code) return
    setRunLoading(true)
    setRunOutput('Running...')
    try {
      const logs: string[] = []
      const originalLog = console.log
      console.log = (...args: any[]) => { logs.push(args.join(' ')); originalLog(...args) }
      try { eval(session.original_code) } catch (error: any) {
        setRunOutput(error.toString()); setRunError(true); console.log = originalLog; return
      }
      console.log = originalLog
      if (logs.length > 0) { setRunOutput(logs.join('\n')); setRunError(false) }
      else { setRunOutput('Program executed successfully with no output.'); setRunError(false) }
    } catch (e: any) { setRunOutput('Execution failed'); setRunError(true) }
    finally { setRunLoading(false) }
  }

  if (initializing) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: '15px', marginBottom: '8px' }}>Preparing your session</div>
        <div style={{ color: '#444', fontSize: '13px' }}>Analyzing and generating first question...</div>
      </div>
    </div>
  )

  const modeColor = MODE_COLORS[session?.mode] || '#fff'
  const userExchanges = messages.filter(m => m.role === 'user').length
  const showGiveUp = userExchanges >= 2 && !sessionComplete

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(24px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#555', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <svg width="28" height="28" viewBox="0 0 44 44">
              <defs><linearGradient id="nlg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
              <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
              <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#nlg2)" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
              <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.4px' }}>SocraticAI</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#e5e5e5', fontWeight: 500 }}>{session?.problem_title || session?.topic}</div>
          <div style={{ fontSize: '11px', color: '#444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span>Exchange {Math.min(questionCount, 10)} · {MODE_LABELS[session?.mode]}</span>
            {session?.mode === 'interview' && (
              <span style={{ color: timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#34d399', fontWeight: 600, fontSize: '12px', background: timeLeft < 300 ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${timeLeft < 300 ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)'}` }}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({length: Math.max(5, questionCount)}, (_, i) => i + 1).map(n => (
              <div key={n} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: n <= questionCount ? modeColor : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                opacity: n > 5 ? 0.6 : 1
              }}/>
            ))}
          </div>
          {session?.mode === 'review' && (
            <button onClick={() => setShowRunner(!showRunner)} style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              ▶ Run Code
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' as const }}>
            Change mode
          </button>
        </div>
      </nav>

      {/* Code Runner */}
      {showRunner && session?.mode === 'review' && (
        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', marginTop: '60px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const }}>Code Execution</span>
              <button onClick={executeCode} disabled={runLoading} style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '6px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {runLoading ? '⏳ Running...' : '▶ Run'}
              </button>
            </div>
            <pre style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${runError ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: runError ? '#f87171' : '#34d399', minHeight: '60px', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const, margin: 0 }}>
              {runOutput || '// Output will appear here'}
            </pre>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '80px 0 200px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px', animation: 'fadeIn 0.3s ease-out both' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1c1c1e', border: '1px solid #2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>S</span>
                </div>
              )}
              <div style={{ maxWidth: '75%', background: msg.role === 'user' ? '#0a84ff' : '#1c1c1e', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '12px 16px', fontSize: '15px', lineHeight: 1.6, color: '#fff' }}>
                <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>
                  {renderContent(msg.content)}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                  Exchange {Math.floor(i / 2) + 1}
                </div>
              </div>
              {msg.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1c1c1e', border: '1px solid #2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>S</span>
              </div>
              <div style={{ background: '#1c1c1e', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 150, 300].map((d, i) => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#555', animation: `bounce 1.2s ${d}ms infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px 16px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Session complete buttons */}
          {sessionComplete && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '8px 0', flexWrap: 'wrap' as const }}>
              {session?.mode === 'interview' ? (
                <button onClick={() => router.push(`/interview-report/${sessionId}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  🎤 Get Interview Report Card
                </button>
              ) : (
                <button onClick={() => router.push(`/certificate/${sessionId}`)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  🏆 Get Certificate
                </button>
              )}
              {session?.mode === 'review' && (
                <button onClick={() => router.push(`/complexity/${sessionId}`)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  📊 Analyze Complexity
                </button>
              )}
              <button onClick={() => router.push(`/variants/${sessionId}`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                🧩 Similar Problems
              </button>
              <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Dashboard
              </button>
            </div>
          )}

          {/* Main input row */}
          {!sessionComplete && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type your answer... (Enter to send)"
                rows={2}
                style={{ flex: 1, background: '#1c1c1e', border: '1px solid #2c2c2e', borderRadius: '16px', padding: '12px 16px', color: '#fff', fontSize: '14px', resize: 'none' as const, fontFamily: 'Inter,sans-serif', outline: 'none', lineHeight: 1.6, minHeight: '52px' }}
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', opacity: loading || !input.trim() ? 0.3 : 1, whiteSpace: 'nowrap' as const }}>
                Send →
              </button>
            </div>
          )}

          {/* Give up button — shows after 2 exchanges */}
          {showGiveUp && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleTeachMe}
                disabled={loading}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#444', padding: '6px 20px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
              >
                I give up — teach me
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}