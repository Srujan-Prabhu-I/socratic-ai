'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import SortVisualizer from '@/components/SortVisualizer'
import BinarySearchVisualizer from '@/components/BinarySearchVisualizer'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const defaultCode = `function bubbleSort(arr){
  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-i-1;j++){
      if(arr[j]>arr[j+1]){
        [arr[j],arr[j+1]]=[arr[j+1],arr[j]]
      }
    }
  }
  return arr
}`

function detectAlgorithm(code: string) {
  if (code.includes('binarySearch') || code.includes('mid') || code.includes('Math.floor((left + right) / 2)')) {
    return 'binary'
  }
  
  if (code.includes('bubble') || code.includes('arr[j] > arr[j+1]') || code.includes('arr[j] > arr[j + 1]')) {
    return 'bubble'
  }
  
  return 'unknown'
}

function CodeVisualizerContent() {
  const searchParams = useSearchParams()
  const passedCode = searchParams.get("code")

  const [code, setCode] = useState(passedCode || defaultCode)
  const [algorithm, setAlgorithm] = useState<'bubble' | 'binary' | 'unknown' | null>(null)
  const [explanation, setExplanation] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleVisualize = () => {
    setIsAnalyzing(true)
    const detected = detectAlgorithm(code)
    setAlgorithm(detected)
    
    if (detected === 'bubble') {
      setExplanation("Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. Larger elements 'bubble' up to the end of the array with each pass.")
    } else if (detected === 'binary') {
      setExplanation("Binary Search works by repeatedly dividing the search interval in half. It compares the target value to the middle element of the array, eliminating half of the remaining elements with each step.")
    } else {
      setExplanation("Could not detect a supported algorithm. Please paste Bubble Sort or Binary Search code.")
    }
    
    setIsAnalyzing(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.9)'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#fff'
        }}>
          Code Visualizer
        </div>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </nav>

      {/* Main Content */}
      <div style={{
        padding: '32px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Paste Your Algorithm Code
        </h1>

        {/* Code Editor */}
        <div style={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '20px'
        }}>
          <Editor
            height="300px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* Visualize Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <button
            onClick={handleVisualize}
            disabled={isAnalyzing}
            style={{
              background: isAnalyzing ? 'rgba(255,255,255,0.05)' : '#4ade80',
              border: 'none',
              color: isAnalyzing ? 'rgba(255,255,255,0.4)' : '#000',
              padding: '12px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isAnalyzing ? 'Analyzing...' : '🔍 Visualize'}
          </button>
        </div>

        {/* AI Explanation Panel */}
        {algorithm && (
          <div style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              AI Analysis
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6
            }}>
              {explanation}
            </div>
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: algorithm === 'unknown' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
              borderRadius: '6px',
              border: `1px solid ${algorithm === 'unknown' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
              fontSize: '13px',
              color: algorithm === 'unknown' ? '#f87171' : '#4ade80',
              fontWeight: 600
            }}>
              Detected: {algorithm === 'bubble' ? 'Bubble Sort' : algorithm === 'binary' ? 'Binary Search' : 'Unknown Algorithm'}
            </div>
          </div>
        )}

        {/* Visualization */}
        {algorithm === 'bubble' && <SortVisualizer />}
        {algorithm === 'binary' && <BinarySearchVisualizer />}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px'
    }}>Loading visualizer...</div>}>
      <CodeVisualizerContent />
    </Suspense>
  )
}
