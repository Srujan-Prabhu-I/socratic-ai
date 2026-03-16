'use client'

import { useState, useCallback } from 'react'

interface SortVisualizerProps {
  onStep?: (step: string) => void
}

export default function SortVisualizer({ onStep }: SortVisualizerProps) {
  const initialArray = [5, 3, 8, 2, 7, 1, 6, 4]
  const [array, setArray] = useState(initialArray)
  const [sorting, setSorting] = useState(false)
  const [comparing, setComparing] = useState<number[]>([])
  const [swapping, setSwapping] = useState<number[]>([])
  const [speed, setSpeed] = useState(800)
  const [explanation, setExplanation] = useState("Click start to visualize the algorithm.")

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const bubbleSort = useCallback(async () => {
    setSorting(true)
    setExplanation("Starting Bubble Sort algorithm...")
    onStep?.("Starting Bubble Sort algorithm...")
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      setExplanation(`Pass ${i + 1}: Scanning through the array`)
      onStep?.(`Pass ${i + 1}: Scanning through the array`)
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1])
        setExplanation(`Comparing ${arr[j]} and ${arr[j + 1]}`)
        onStep?.(`Comparing ${arr[j]} and ${arr[j + 1]}`)
        await sleep(speed)

        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1])
          setExplanation(`Swapping ${arr[j]} and ${arr[j + 1]} because ${arr[j]} > ${arr[j + 1]}`)
          onStep?.(`Swapping ${arr[j]} and ${arr[j + 1]}`)
          await sleep(speed / 2)
          
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp
          
          setArray([...arr])
          await sleep(speed / 2)
          setSwapping([])
        }
        
        setComparing([])
      }
    }
    
    setExplanation("Array sorted successfully using Bubble Sort. Larger elements 'bubbled' to the top!")
    onStep?.("Array sorted successfully!")
    setSorting(false)
  }, [array, speed, onStep])

  const reset = () => {
    setArray(initialArray)
    setComparing([])
    setSwapping([])
    setSorting(false)
    setExplanation("Click start to visualize the algorithm.")
  }

  const maxValue = Math.max(...array)

  return (
    <div>
      {/* Speed Control */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <label style={{ marginBottom: "6px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
          Animation Speed
        </label>

        <input
          type="range"
          min="200"
          max="1200"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={sorting}
          style={{ width: "220px" }}
        />
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center'
      }}>
        <button
          onClick={bubbleSort}
          disabled={sorting}
          style={{
            background: sorting ? 'rgba(255,255,255,0.05)' : '#4ade80',
            border: 'none',
            color: sorting ? 'rgba(255,255,255,0.4)' : '#000',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: sorting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {sorting ? 'Sorting...' : 'Start Bubble Sort'}
        </button>
        <button
          onClick={reset}
          disabled={sorting}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: sorting ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: sorting ? 'not-allowed' : 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Explanation Panel */}
      <div style={{
        marginBottom: "20px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        fontSize: "14px",
        color: "rgba(255,255,255,0.85)"
      }}>
        {explanation}
      </div>

      {/* Array Display */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '12px',
        height: '300px',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {array.map((value, index) => {
          const isComparing = comparing.includes(index)
          const isSwapping = swapping.includes(index)
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: `${(value / maxValue) * 200}px`,
                  background: isSwapping 
                    ? '#f87171' 
                    : isComparing 
                      ? '#fbbf24' 
                      : '#4ade80',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease',
                  boxShadow: isSwapping 
                    ? '0 0 20px rgba(248,113,113,0.5)' 
                    : isComparing 
                      ? '0 0 20px rgba(251,191,36,0.5)' 
                      : '0 0 10px rgba(74,222,128,0.3)'
                }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isComparing || isSwapping ? '#fff' : 'rgba(255,255,255,0.6)'
              }}>
                {value}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#4ade80', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Normal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Comparing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#f87171', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Swapping</span>
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          marginBottom: '12px',
          color: '#fff'
        }}>
          How Bubble Sort Works
        </h3>
        <p style={{ 
          fontSize: '14px', 
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.6)'
        }}>
          Bubble Sort repeatedly steps through the array, compares adjacent elements, 
          and swaps them if they are in the wrong order. The pass through the array 
          is repeated until the array is sorted. Larger values &quot;bubble&quot; to the top 
          with each pass.
        </p>
      </div>
    </div>
  )
}
