'use client'

import { useState, useCallback } from 'react'

interface QuickSortVisualizerProps {
  onStep?: (step: string) => void
}

export default function QuickSortVisualizer({ onStep }: QuickSortVisualizerProps) {
  const initialArray = [64, 34, 25, 12, 22, 11, 90, 5]
  const [array, setArray] = useState(initialArray)
  const [sorting, setSorting] = useState(false)
  const [pivot, setPivot] = useState<number | null>(null)
  const [swapping, setSwapping] = useState<number[]>([])
  const [sorted, setSorted] = useState<number[]>([])
  const [speed, setSpeed] = useState(800)
  const [explanation, setExplanation] = useState("Click start to visualize QuickSort.")

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const resetVisualization = () => {
    setArray(initialArray)
    setPivot(null)
    setSwapping([])
    setSorted([])
    setSorting(false)
    setExplanation("Click start to visualize QuickSort.")
  }

  const partition = async (arr: number[], low: number, high: number) => {
    const pivotValue = arr[high]
    setPivot(high)
    setExplanation(`Pivot selected: ${pivotValue} at index ${high}`)
    onStep?.(`Pivot selected: ${pivotValue}`)
    await sleep(speed)
    
    let i = low - 1
    
    for (let j = low; j < high; j++) {
      setExplanation(`Comparing ${arr[j]} with pivot ${pivotValue}`)
      onStep?.(`Comparing ${arr[j]} with pivot ${pivotValue}`)
      await sleep(speed / 2)
      
      if (arr[j] < pivotValue) {
        i++
        setSwapping([i, j])
        setExplanation(`Swapping ${arr[i]} and ${arr[j]} because ${arr[j]} < ${pivotValue}`)
        onStep?.(`Swapping ${arr[i]} and ${arr[j]}`)
        await sleep(speed / 2)
        
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
        
        setArray([...arr])
        await sleep(speed / 2)
        setSwapping([])
      }
    }
    
    setSwapping([i + 1, high])
    setExplanation(`Placing pivot ${pivotValue} in correct position`)
    onStep?.(`Placing pivot ${pivotValue} in correct position`)
    await sleep(speed / 2)
    
    const temp = arr[i + 1]
    arr[i + 1] = arr[high]
    arr[high] = temp
    
    setArray([...arr])
    await sleep(speed / 2)
    setSwapping([])
    setPivot(null)
    
    return i + 1
  }

  const quickSort = useCallback(async (arr: number[], low: number, high: number) => {
    if (low < high) {
      const pi = await partition(arr, low, high)
      
      setSorted(prev => [...prev, pi])
      onStep?.(`Partition complete, pivot at index ${pi}`)
      
      await quickSort(arr, low, pi - 1)
      await quickSort(arr, pi + 1, high)
    } else if (low >= 0 && high >= 0 && low === high) {
      setSorted(prev => [...prev, low])
    }
  }, [speed, onStep])

  const startQuickSort = async () => {
    setSorting(true)
    setExplanation("Starting QuickSort algorithm...")
    onStep?.("Starting QuickSort algorithm...")
    const arr = [...array]
    await quickSort(arr, 0, arr.length - 1)
    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setExplanation("Array sorted successfully using QuickSort!")
    onStep?.("Array sorted successfully!")
    setSorting(false)
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
          min="400"
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
          onClick={startQuickSort}
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
          {sorting ? 'Sorting...' : 'Start QuickSort'}
        </button>
        <button
          onClick={resetVisualization}
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
          const isPivot = index === pivot
          const isSwapping = swapping.includes(index)
          const isSorted = sorted.includes(index)
          
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
                    : isPivot 
                      ? '#fbbf24' 
                      : isSorted
                        ? '#22c55e'
                        : '#4ade80',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease',
                  boxShadow: isSwapping 
                    ? '0 0 20px rgba(248,113,113,0.5)' 
                    : isPivot 
                      ? '0 0 20px rgba(251,191,36,0.5)'
                      : isSorted
                        ? '0 0 15px rgba(34,197,94,0.4)'
                        : '0 0 10px rgba(74,222,128,0.3)'
                }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isPivot || isSwapping ? '#fff' : 'rgba(255,255,255,0.6)'
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
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Unsorted</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Pivot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#f87171', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Swapping</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Sorted</span>
        </div>
      </div>
    </div>
  )
}
