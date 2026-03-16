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
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [initializing, setInitializing] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes
  const [timerActive, setTimerActive] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: auth } }) => {
      if (!auth) { router.push('/auth'); return }
      loadSession(sessionId)
    })
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (session?.mode !== 'interview') return
    setTimerActive(true)
    setTimerStarted(true)
  }, [session])

  useEffect(() => {
    if (!timerActive || session?.mode !== 'interview') return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          setTimerActive(false)
          return 0
        }
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
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages([aiMsg])
      setQuestionCount(1)
      await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: data.message })
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
          messages: [...messages, { role: 'user', content: '[TEACH_ME]' }],
          mode: session.mode,
          questionCount,
          problemTitle: session.problem_title,
          originalCode: session.original_code,
          language: session.language,
          topic: session.topic,
          difficulty: session.difficulty,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, { role: 'user', content: '[TEACH_ME]' }, aiMsg])
      setQuestionCount(prev => prev + 1)
      await supabase.from('messages').insert({ session_id: sessionId, role: 'user', content: '[TEACH_ME]' })
      await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: data.message })
      await supabase.from('sessions').update({ status: 'learned' }).eq('id', sessionId)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
      setQuestionCount(prev => prev + 1)
      await supabase.from('messages').insert({ session_id: sessionId, role: 'assistant', content: data.message })
      // Remove hard limit - session continues until student solves it
      
      // Check if AI indicates session is complete [SOLVED]
      if (data.message.includes('[SOLVED]')) {
        await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
        // Award XP based on questions used (fewer = better understanding)
        const xpEarned = Math.max(100 - (questionCount * 10), 50)
        const { data: prog } = await supabase.from('progress').select('*').eq('user_id', session.user_id).single()
        const today = new Date().toISOString().split('T')[0]
        if (prog) {
          const lastDate = prog.last_session_date
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const newStreak = lastDate === yesterday ? (prog.streak || 0) + 1 : lastDate === today ? prog.streak : 1
          const newXP = (prog.xp || 0) + xpEarned
          const newBadges = [...(prog.badges || [])]
          if (newXP >= 500 && !newBadges.includes('xp_500')) newBadges.push('xp_500')
          if (newStreak >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3')
          if ((prog.problems_solved || 0) + 1 >= 5 && !newBadges.includes('problems_5')) newBadges.push('problems_5')
          await supabase.from('progress').update({
            xp: newXP,
            streak: newStreak,
            last_session_date: today,
            problems_solved: (prog.problems_solved || 0) + 1,
            total_sessions: (prog.total_sessions || 0) + 1,
            badges: newBadges,
          }).eq('user_id', session.user_id)
        } else {
          await supabase.from('progress').insert({
            user_id: session.user_id,
            xp: xpEarned,
            streak: 1,
            last_session_date: today,
            problems_solved: 1,
            total_sessions: 1,
            badges: [],
          })
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const renderContent = (content: string) => content.split('```').map((part, i) =>
    i % 2 === 1
      ? <pre key={i} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'12px 16px',margin:'8px 0',overflowX:'auto',fontSize:'12px',color:'#e5e5e5',fontFamily:'monospace',lineHeight:1.6}}>{part.replace(/^[a-z]+\n/,'')}</pre>
      : <span key={i}>{part}</span>
  )

  if (initializing) return (
    <div style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{color:'#fff',fontSize:'15px',marginBottom:'8px'}}>Preparing your session</div>
        <div style={{color:'#444',fontSize:'13px'}}>Analyzing and generating first question...</div>
      </div>
    </div>
  )

  const modeColor = MODE_COLORS[session?.mode] || '#fff'

  return (
    <div style={{minHeight:'100vh',background:'#000',fontFamily:'Inter,sans-serif',color:'#fff',display:'flex',flexDirection:'column'}}>
      {/* Nav */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 32px',borderBottom:'1px solid rgba(255,255,255,0.07)',background:'rgba(0,0,0,0.9)',backdropFilter:'blur(24px)',position:'fixed',top:0,left:0,right:0,zIndex:10}}>
  
  {/* Left — back + logo */}
  <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
    <button
      onClick={() => router.push('/dashboard')}
      style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'#555',padding:'6px 14px',borderRadius:'7px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',gap:'6px'}}>
      ← Back
    </button>
    <div style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}} onClick={() => router.push('/')}>
      <svg width="28" height="28" viewBox="0 0 44 44">
        <defs>
          <linearGradient id="nlg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#fff" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#nlg)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
        <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
      </svg>
      <span style={{fontSize:'14px',fontWeight:700,letterSpacing:'-0.4px'}}>SocraticAI</span>
    </div>
  </div>

  {/* Center — session title + mode */}
  <div style={{textAlign:'center'}}>
    <div style={{fontSize:'13px',color:'#e5e5e5',fontWeight:500}}>{session?.problem_title || session?.topic}</div>
    <div style={{fontSize:'11px',color:'#444',marginTop:'2px',display:'flex',alignItems:'center',gap:'8px',justifyContent:'center'}}>
      <span>Exchange {Math.min(questionCount,10)} · {MODE_LABELS[session?.mode]}</span>
      {session?.mode === 'interview' && (
        <span style={{
          color: timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#34d399',
          fontWeight: 600,
          fontSize: '12px',
          background: timeLeft < 300 ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
          padding: '2px 8px',
          borderRadius: '100px',
          border: `1px solid ${timeLeft < 300 ? 'rgba(239,68,68,0.2)' : 'rgba(52,211,153,0.2)'}`,
        }}>
          ⏱ {formatTime(timeLeft)}
        </span>
      )}
    </div>
  </div>

  {/* Right — progress dots + change mode */}
  <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
    <div style={{display:'flex',gap:'6px'}}>
      {[1,2,3,4,5].map(n => (
        <div key={n} style={{width:'6px',height:'6px',borderRadius:'50%',background:n<=questionCount?modeColor:questionCount>=5?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.1)', boxShadow:questionCount>=5 && n<=5?'0 0 8px rgba(255,255,255,0.2)':'none', transition:'all 0.3s'}}/>
      ))}
      {questionCount > 5 && (
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.3)', animation:'pulse 2s infinite'}}/>
      )}
    </div>
    <button
      onClick={() => router.push('/dashboard')}
      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#888',padding:'6px 14px',borderRadius:'7px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap' as const}}>
      Change mode
    </button>
  </div>
</nav>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'80px 0 120px',maxWidth:'720px',margin:'0 auto',width:'100%'}}>
        <div style={{padding:'0 24px',display:'flex',flexDirection:'column',gap:'16px'}}>
          {messages.map((msg, i) => (
            <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start'}}>
              <div style={{
                maxWidth:'80%',
                background:msg.role==='user'?'rgba(255,255,255,0.08)':'transparent',
                border:msg.role==='user'?'1px solid rgba(255,255,255,0.1)':'none',
                borderRadius:'12px',
                padding:msg.role==='user'?'12px 16px':'4px 0',
              }}>
                {msg.role==='assistant' && (
                  <div style={{fontSize:'10px',color:modeColor,fontWeight:600,letterSpacing:'1px',marginBottom:'8px'}}>{MODE_LABELS[session?.mode]?.toUpperCase()}</div>
                )}
                <div style={{fontSize:'14px',lineHeight:1.7,color:msg.role==='user'?'#ccc':'#e5e5e5',whiteSpace:'pre-wrap'}}>
                  {renderContent(msg.content)}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex',gap:'6px',padding:'4px 0'}}>
              {[0,150,300].map((d,i) => (
                <div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:'#333',animation:`bounce 1.2s ${d}ms infinite`}}/>
              ))}
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>
      </div>

      {/* Input */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(24px)',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'16px 24px'}}>
        <div style={{maxWidth:'720px',margin:'0 auto',display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'flex-end'}}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
              placeholder="Type your answer... (Enter to send)"
              rows={2}
              style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'12px 16px',color:'#fff',fontSize:'14px',resize:'none',fontFamily:'Inter,sans-serif',outline:'none',lineHeight:1.6}}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading||!input.trim()}
              style={{background:'#fff',color:'#000',border:'none',padding:'12px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'Inter,sans-serif',opacity:loading||!input.trim()?0.3:1,whiteSpace:'nowrap'}}
            >
              Send →
            </button>
          </div>
          <button
            onClick={handleTeachMe}
            disabled={loading}
            style={{alignSelf:'flex-start',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',padding:'8px 16px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}
          >
            I give up — teach me
          </button>
          {questionCount > 5 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',padding:'8px 24px 12px'}}>
              {session?.mode === 'interview' ? (
                <button
                  onClick={() => router.push(`/interview-report/${sessionId}`)}
                  style={{background:'#fff',color:'#000',border:'none',padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                >
                  🎤 Get Interview Report Card
                </button>
              ) : session?.mode === 'review' ? (
                <div style={{display:'flex',gap:'12px'}}>
                  <button
                    onClick={() => router.push(`/complexity/${sessionId}`)}
                    style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',padding:'10px 20px',borderRadius:'8px',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                  >
                    📊 Analyze Complexity
                  </button>
                  <button
                    onClick={() => router.push(`/certificate/${sessionId}`)}
                    style={{background:'#fff',color:'#000',border:'none',padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                  >
                    🏆 Get Certificate
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/certificate/${sessionId}`)}
                  style={{background:'#fff',color:'#000',border:'none',padding:'10px 24px',borderRadius:'8px',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                >
                  🏆 Get Certificate
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#666',padding:'10px 20px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  )
}