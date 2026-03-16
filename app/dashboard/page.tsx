'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      loadSessions(session.user.id)
      loadProgress(session.user.id)
    })
  }, [])

  const loadSessions = async (userId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setSessions(data || [])
    setLoading(false)
  }

  const loadProgress = async (userId: string) => {
    const { data: prog } = await supabase.from('progress').select('*').eq('user_id', userId).single()
    if (prog) setProgress(prog)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const startSession = (mode: string) => {
    if (mode === 'ask') router.push('/session/new?mode=ask')
    else if (mode === 'review') router.push('/session/new?mode=review')
    else if (mode === 'learn') router.push('/session/new?mode=learn')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'#555',fontSize:'14px'}}>Loading...</span>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#000',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'64px 64px',pointerEvents:'none'}}/>
      
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 40px',borderBottom:'1px solid rgba(255,255,255,0.07)',position:'fixed',top:0,left:0,right:0,zIndex:10,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(24px)',width:'100%'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={() => router.push('/')}>
          <svg width="36" height="36" viewBox="0 0 44 44">
            <defs>
              <linearGradient id="dlg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#dlg)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
          </svg>
          <span style={{fontSize:'15px',fontWeight:700,letterSpacing:'-0.4px'}}>SocraticAI</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginRight:'16px'}}>
            <span style={{fontSize:'12px',color:'#f59e0b',fontWeight:600}}>
              🔥 {progress?.streak || 0} day streak
            </span>
            <span style={{fontSize:'12px',color:'#a78bfa',fontWeight:600}}>
              ⚡ {progress?.xp || 0} XP
            </span>
          </div>
          <span style={{fontSize:'13px',color:'#555'}}>{user?.email}</span>
          <button onClick={handleSignOut} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#666',padding:'6px 16px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>Sign out</button>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'100px 40px 60px',position:'relative',zIndex:5}}>
        
        {/* Mode selector */}
        <div style={{marginBottom:'48px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
            <h2 style={{fontSize:'22px',fontWeight:600,letterSpacing:'-0.5px',marginBottom:'8px'}}>Start a session</h2>
            <div style={{display:'flex',gap:'12px'}}>
              <button
                onClick={() => router.push('/problems')}
                style={{background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#888',padding:'11px 20px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}
              >
                📚 Problem Library
              </button>
            </div>
          </div>
          <p style={{fontSize:'13px',color:'#555',marginBottom:'24px'}}>Choose your learning mode</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
            {[
              {mode:'ask',title:'Ask & Learn',desc:'Ask any DSA question naturally',icon:'💬'},
              {mode:'review',title:'Code Review',desc:'Paste code, find the bug yourself',icon:'🔍'},
              {mode:'learn',title:'Learn a Topic',desc:'Pick a topic, get a curriculum',icon:'📚'},
              {mode:'interview',title:'Interview Sim',desc:'Mock interviews with Amazon, Google, Meta and more',icon:'🎤'},
            ].map((m) => (
              <button key={m.mode} onClick={() => m.mode === 'interview' ? router.push('/interview') : startSession(m.mode)} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'24px 20px',textAlign:'left',cursor:'pointer',transition:'border-color 0.2s',color:'#fff',fontFamily:'Inter,sans-serif'}}>
                <div style={{fontSize:'20px',marginBottom:'12px'}}>{m.icon}</div>
                <div style={{fontSize:'14px',fontWeight:500,color:'#e5e5e5',marginBottom:'6px'}}>{m.title}</div>
                <div style={{fontSize:'12px',color:'#555',lineHeight:1.5}}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Session history */}
        <div>
          <h2 style={{fontSize:'16px',fontWeight:500,color:'#666',marginBottom:'16px',letterSpacing:'-0.2px'}}>Recent sessions</h2>
          {sessions.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'48px',textAlign:'center'}}>
              <p style={{color:'#333',fontSize:'14px'}}>No sessions yet — start one above</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1px',background:'rgba(255,255,255,0.06)',borderRadius:'12px',overflow:'hidden'}}>
              {sessions.map((s) => (
                <div key={s.id} onClick={() => router.push(`/session/${s.id}`)} style={{background:'#000',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                  <div>
                    <div style={{fontSize:'14px',color:'#e5e5e5',fontWeight:400,marginBottom:'4px'}}>{s.problem_title || s.topic || 'Session'}</div>
                    <div style={{fontSize:'12px',color:'#444'}}>{new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:MODE_COLORS[s.mode] || '#555',border:`1px solid ${MODE_COLORS[s.mode] || '#333'}33`,padding:'3px 10px',borderRadius:'100px'}}>{MODE_LABELS[s.mode] || s.mode}</span>
                    <span style={{fontSize:'11px',color:s.status==='completed'?'#10b981':'#666',border:`1px solid ${s.status==='completed'?'#10b98133':'#ffffff11'}`,padding:'3px 10px',borderRadius:'100px'}}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {progress?.badges?.length > 0 && (
        <div style={{marginTop:'32px'}}>
          <h2 style={{fontSize:'14px',fontWeight:500,color:'#666',marginBottom:'16px'}}>Achievements</h2>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            {progress.badges.map((b: string) => (
              <div key={b} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'12px 16px',textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>
                  {b === 'xp_500' ? '⚡' : b === 'streak_3' ? '🔥' : b === 'problems_5' ? '🏆' : '🎯'}
                </div>
                <div style={{fontSize:'10px',color:'#555',letterSpacing:'1px'}}>
                  {b === 'xp_500' ? '500 XP' : b === 'streak_3' ? '3 Day Streak' : b === 'problems_5' ? '5 Problems' : b}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}