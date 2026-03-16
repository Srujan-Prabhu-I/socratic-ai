'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import ConstellationBackground from "@/components/ConstellationBackground"

function InfinityLogo({ size = 'hero' }: { size?: 'hero' | 'nav' }) {
  const arcRef = useRef<SVGPathElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const cursorRef = useRef<SVGRectElement>(null)
  const dot1Ref = useRef<SVGCircleElement>(null)
  const dot2Ref = useRef<SVGCircleElement>(null)

  const isHero = size === 'hero'
  const W = isHero ? 560 : 220
  const H = isHero ? 88 : 40
  const VW = isHero ? 200 : 130
  const VH = 44
  const fontSize = isHero ? 22 : 13
  const strokeW = isHero ? 3.5 : 3
  const glowW = isHero ? 10 : 8
  const dotR = isHero ? 2.5 : 2
  const textX = 37
  const textY = isHero ? 29 : 28
  const cursorY = isHero ? 8 : 16
  const cursorH = isHero ? 22 : 13
  const cursorW = isHero ? 2.5 : 1.5
  const charW = isHero ? 12.8 : 7.6
  const fullWord = 'SocraticAI'

  useEffect(() => {
    const arc = arcRef.current
    const textEl = textRef.current
    const cursor = cursorRef.current
    const d1 = dot1Ref.current
    const d2 = dot2Ref.current
    if (!arc || !textEl || !cursor || !d1 || !d2) return

    let t1: any, t2: any, t3: any, iv: any, t4: any, t5: any

    function run() {
      arc.style.transition = 'none'
      arc.setAttribute('stroke-dashoffset', '89')
      textEl.textContent = ''
      textEl.setAttribute('opacity', '0')
      cursor.setAttribute('opacity', '0')
      d1.setAttribute('opacity', '0')
      d2.setAttribute('opacity', '0')
      cursor.setAttribute('x', String(textX))

      t1 = setTimeout(() => {
        arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.6,0,0.2,1)'
        arc.setAttribute('stroke-dashoffset', '0')
      }, 200)

      t2 = setTimeout(() => {
        d1.setAttribute('opacity', '0.6')
        d2.setAttribute('opacity', '0.6')
      }, 1400)

      t3 = setTimeout(() => {
        textEl.setAttribute('opacity', '1')
        cursor.setAttribute('opacity', '1')
        let i = 0
        iv = setInterval(() => {
          if (i <= fullWord.length) {
            textEl.textContent = fullWord.slice(0, i)
            cursor.setAttribute('x', String(textX + i * charW))
            i++
          } else {
            clearInterval(iv)
            t4 = setTimeout(() => {
              cursor.setAttribute('opacity', '0')
              t5 = setTimeout(run, 2000)
            }, 1500)
          }
        }, 85)
      }, 1500)
    }

    run()

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearInterval(iv)
    }
  }, [])

  return (
    <svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`}>
      <defs>
        <linearGradient id={`lg-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      <path
        d="M 35 11 A 17 17 0 1 0 35 33"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={glowW}
        strokeLinecap="round"
      />

      <path
        ref={arcRef}
        d="M 35 11 A 17 17 0 1 0 35 33"
        fill="none"
        stroke={`url(#lg-${size})`}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray="89"
        strokeDashoffset="89"
      />

      <circle ref={dot1Ref} cx="35" cy="11" r={dotR} fill="#fff" opacity="0"/>
      <circle ref={dot2Ref} cx="35" cy="33" r={dotR} fill="#fff" opacity="0"/>

      <text
        ref={textRef}
        x={textX}
        y={textY}
        fontFamily="Inter,sans-serif"
        fontWeight="900"
        fontSize={fontSize}
        fill="#fff"
        opacity="0"
      />

      <rect
        ref={cursorRef}
        x={textX}
        y={cursorY}
        width={cursorW}
        height={cursorH}
        fill="#fff"
        opacity="0"
      >
        <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  )
}

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ position:"relative", background:'#080808', minHeight:'100vh', color:'#fff', fontFamily:'Inter,sans-serif' }}>
      <ConstellationBackground />

      <div style={{ position:"relative", zIndex: 10 }}>

      {/* GRID BACKGROUND */}
      <div style={{
        position:'fixed',
        inset:0,
        backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
        backgroundSize:'72px 72px',
        pointerEvents:'none'
      }}/>

      {/* NAVBAR */}
      <nav style={{
        height:'60px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        padding:'0 40px',
        borderBottom:'1px solid rgba(255,255,255,0.06)'
      }}>
        <InfinityLogo size="nav"/>

        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={()=>router.push('/auth')}
            style={{
              background:'transparent',
              border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(255,255,255,0.8)',
              padding:'8px 18px',
              borderRadius:'8px',
              fontSize:'13px',
              cursor:'pointer'
            }}
          >
            Sign in
          </button>

          <button onClick={()=>router.push('/auth')}
            style={{
              background:'#fff',
              color:'#000',
              border:'none',
              padding:'8px 18px',
              borderRadius:'8px',
              fontSize:'13px',
              fontWeight:600,
              cursor:'pointer'
            }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        minHeight:'calc(100vh - 60px)',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
      }}>
        <InfinityLogo size="hero"/>

        <div style={{display:'flex',gap:'12px',marginTop:'32px'}}>
          <button onClick={()=>router.push('/auth')}
            style={{
              background:'#fff',
              color:'#000',
              border:'none',
              padding:'12px 28px',
              borderRadius:'10px',
              fontSize:'14px',
              fontWeight:600,
              cursor:'pointer'
            }}
          >
            Start learning free
          </button>

          <button onClick={()=>router.push('/dashboard')}
            style={{
              background:'transparent',
              border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(255,255,255,0.8)',
              padding:'12px 28px',
              borderRadius:'10px',
              fontSize:'14px',
              cursor:'pointer'
            }}
          >
            Dashboard →
          </button>

          <button onClick={()=>router.push('/demo')}
            style={{
              background:'transparent',
              border:'1px solid rgba(239,68,68,0.3)',
              color:'#ef4444',
              padding:'11px 28px',
              borderRadius:'8px',
              fontSize:'14px',
              cursor:'pointer'
            }}
          >
            ⚡ Live Demo
          </button>

          <button 
            onClick={() => router.push('/code-visualize-ai')}
            style={{
              border:'1px solid rgba(255,255,255,0.2)',
              background:'transparent',
              color:'white',
              padding:'12px 28px',
              borderRadius:'10px',
              cursor:'pointer'
            }}
          >
            AI Visualizer
          </button>
        </div>

        {/* ICON CARDS */}
        <div style={{
          display:'flex',
          gap:'56px',
          marginTop:'48px'
        }}>

          <Card title="Ask" desc="Ask questions" mode="ask" router={router}/>
          <Card title="Debug" desc="Fix your code" mode="review" router={router}/>
          <Card title="Learn" desc="Master DSA" mode="learn" router={router}/>
          <Card title="Visualize" desc="See algorithms" mode="visualize" router={router}/>
          <Card title="Code Viz" desc="Paste & visualize" mode="code-visualize" router={router}/>

        </div>
      </div>
    </div>
  </div>
  )
}

function Card({title,desc,mode,router}:any){

  const icons:any = {
    ask: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),

    review: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),

    learn: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),

    visualize: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="8" y1="17" x2="8" y2="10"></line>
        <line x1="12" y1="17" x2="12" y2="7"></line>
        <line x1="16" y1="17" x2="16" y2="12"></line>
      </svg>
    ),

    'code-visualize': (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
        <line x1="12" y1="2" x2="12" y2="22"></line>
      </svg>
    )
  }

  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <button
        onClick={()=>{
          if(mode === 'visualize'){
            router.push('/visualize')
          } else if(mode === 'code-visualize'){
            router.push('/code-visualize')
          } else {
            router.push(`/auth?redirect=/session/new?mode=${mode}`)
          }
        }}
        style={{
          width:'72px',
          height:'72px',
          borderRadius:'16px',
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.08)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          cursor:'pointer',
          transition:'all 0.2s ease'
        }}
        onMouseEnter={(e)=>{
          e.currentTarget.style.transform='translateY(-4px)'
          e.currentTarget.style.border='1px solid rgba(255,255,255,0.16)'
        }}
        onMouseLeave={(e)=>{
          e.currentTarget.style.transform='translateY(0)'
          e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'
        }}
      >
        {icons[mode]}
      </button>

      <div style={{fontSize:'14px',fontWeight:600,marginTop:'10px'}}>
        {title}
      </div>

      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.45)'}}>
        {desc}
      </div>
    </div>
  )
}