'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VisualizeAI(){

  const router = useRouter()

  const [code,setCode] = useState("")
  const [algorithm,setAlgorithm] = useState("")
  const [loading,setLoading] = useState(false)

  async function detectAlgorithm(){

    setLoading(true)

    const res = await fetch('/api/detect-algorithm',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({code})
    })

    const data = await res.json()

    setAlgorithm(data.algorithm)
    setLoading(false)

  }

  return(

    <div style={{
      background:'#080808',
      minHeight:'100vh',
      color:'white',
      padding:'60px',
      fontFamily:'Inter,sans-serif'
    }}>

      <h1 style={{fontSize:28,fontWeight:700}}>
        AI Algorithm Visualizer
      </h1>

      <p style={{opacity:0.7,marginBottom:20}}>
        Paste your algorithm and SocraticAI will visualize it.
      </p>

      <textarea
        value={code}
        onChange={(e)=>setCode(e.target.value)}
        placeholder="Paste your algorithm code here..."
        style={{
          width:'100%',
          height:'220px',
          background:'#111',
          color:'white',
          padding:'16px',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'10px'
        }}
      />

      <div style={{marginTop:20}}>

        <button
          onClick={detectAlgorithm}
          style={{
            background:'#22c55e',
            border:'none',
            padding:'10px 20px',
            borderRadius:8,
            cursor:'pointer'
          }}
        >
          {loading ? "Detecting..." : "Detect Algorithm"}
        </button>

      </div>

      {algorithm && (

        <div style={{marginTop:30}}>

          <h3>Detected Algorithm:</h3>

          <div style={{
            marginTop:10,
            padding:12,
            background:'#111',
            borderRadius:8
          }}>
            {algorithm}
          </div>

          {algorithm === "binary-search" && (
            <button
              onClick={() => router.push(`/code-visualize?code=${encodeURIComponent(code)}`)}
              style={{
                marginTop:15,
                background:'#3b82f6',
                border:'none',
                padding:'10px 18px',
                borderRadius:8,
                cursor:'pointer'
              }}
            >
              Open Binary Search Visualizer
            </button>
          )}

        </div>

      )}

    </div>

  )

}
