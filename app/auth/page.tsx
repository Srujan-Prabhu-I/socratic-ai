'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.session) window.location.href = redirect
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (signInData.session) window.location.href = redirect
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#fff', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
      
      <div onClick={() => router.push('/')} style={{ position: 'absolute', top: '24px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 10 }}>
        <svg width="36" height="36" viewBox="0 0 44 44">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#fff" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#ag)" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
          <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
        </svg>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.4px' }}>SocraticAI</span>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 5, padding: '0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ fontSize: '13px', color: '#444' }}>
            {isLogin ? 'Sign in to continue learning' : 'Start your Socratic learning journey'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '12px 16px', color: '#fff', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="•••••••"
              required
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '12px 16px', color: '#fff', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '13px', borderRadius: '9px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginTop: '8px', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '11px', color: '#333' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#444' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#555', fontSize: '14px', fontFamily: 'Inter,sans-serif' }}>Loading...</span>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}