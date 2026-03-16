'use client'

import { useState, useCallback } from 'react'

interface BinarySearchVisualizerProps {
  onStep?: (step: string) => void
}

export default function BinarySearchVisualizer({ onStep }: BinarySearchVisualizerProps) {
  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23])
  const [inputArray, setInputArray] = useState("1,3,5,7,9,11,13,15,17,19,21,23")
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState<number | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [target, setTarget] = useState(13)
  const [inputTarget, setInputTarget] = useState(13)
  const [low, setLow] = useState(-1)
  const [high, setHigh] = useState(-1)
  const [mid, setMid] = useState(-1)
  const [checked, setChecked] = useState<number[]>([])
  const [speed, setSpeed] = useState(800)
  const [explanation, setExplanation] = useState("Click start to visualize the algorithm.")

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  function parseArray(input: string) {
    return input
      .split(",")
      .map(n => Number(n.trim()))
      .filter(n => !isNaN(n))
  }

  const resetVisualization = () => {
    setFound(null)
    setNotFound(false)
    setLow(-1)
    setHigh(-1)
    setMid(-1)
    setChecked([])
    setSearching(false)
    setExplanation("Click start to visualize the algorithm.")
  }

  const handleStartSearch = () => {
    const newArray = parseArray(inputArray)
    const newTarget = Number(inputTarget)

    setArray(newArray)
    setTarget(newTarget)

    resetVisualization()

    setTimeout(() => {
      startBinarySearch(newArray, newTarget)
    }, 50)
  }

  const startBinarySearch = async (arr: number[], targetValue: number) => {
    setExplanation(`Starting Binary Search for target ${targetValue}...`)
    onStep?.(`Starting Binary Search for target ${targetValue}...`)
    
    let l = 0
    let h = arr.length - 1
    const checkedIndices: number[] = []

    while (l <= h) {
      setLow(l)
      setHigh(h)
      setExplanation(`Current search range: index ${l} to ${h}`)
      onStep?.(`Current search range: index ${l} to ${h}`)
      
      const m = Math.floor((l + h) / 2)
      setMid(m)
      checkedIndices.push(m)
      setChecked([...checkedIndices])
      
      setExplanation(`Checking middle element at index ${m}: value ${arr[m]}`)
      onStep?.(`Checking middle element at index ${m}: value ${arr[m]}`)
      await sleep(speed)

      if (arr[m] === targetValue) {
        setFound(m)
        setExplanation(`Target ${targetValue} found at index ${m}!`)
        onStep?.(`Target ${targetValue} found at index ${m}!`)
        setSearching(false)
        return
      }

      if (arr[m] < targetValue) {
        setExplanation(`${arr[m]} < ${targetValue}, so target must be in the right half. Discarding left half.`)
        onStep?.(`${arr[m]} < ${targetValue}, searching right half`)
        l = m + 1
      } else {
        setExplanation(`${arr[m]} > ${targetValue}, so target must be in the left half. Discarding right half.`)
        onStep?.(`${arr[m]} > ${targetValue}, searching left half`)
        h = m - 1
      }
      
      await sleep(speed / 2)
    }

    setNotFound(true)
    setExplanation(`Target ${targetValue} not found in the array. The element does not exist.`)
    onStep?.(`Target ${targetValue} not found`)
    setSearching(false)
  }

  const getBarStyle = (index: number) => {
    const value = array[index]
    const isTarget = value === target
    const isMid = index === mid
    const isInRange = index >= low && index <= high && low !== -1
    const isChecked = checked.includes(index)
    const isFound = index === found

    if (isFound) {
      return {
        background: '#22c55e',
        boxShadow: '0 0 30px rgba(34,197,94,0.6)',
        transform: 'scale(1.1)'
      }
    }

    if (isMid) {
      return {
        background: '#fbbf24',
        boxShadow: '0 0 25px rgba(251,191,36,0.5)'
      }
    }

    if (isChecked) {
      return {
        background: 'rgba(255,255,255,0.2)'
      }
    }

    if (isInRange) {
      return {
        background: '#3b82f6',
        boxShadow: '0 0 15px rgba(59,130,246,0.4)'
      }
    }

    return {
      background: isTarget ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'
    }
  }

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
          disabled={searching}
          style={{ width: "220px" }}
        />
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Target:
          </span>
          <input
            type="number"
            value={inputTarget}
            onChange={(e) => setInputTarget(Number(e.target.value))}
            disabled={searching}
            style={{
              width: '60px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              textAlign: 'center'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Array:
          </span>
          <input
            type="text"
            value={inputArray}
            onChange={(e) => setInputArray(e.target.value)}
            disabled={searching}
            style={{
              width: '200px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <button
          onClick={handleStartSearch}
          disabled={searching}
          style={{
            background: searching ? 'rgba(255,255,255,0.05)' : '#4ade80',
            border: 'none',
            color: searching ? 'rgba(255,255,255,0.4)' : '#000',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: searching ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {searching ? 'Searching...' : 'Start Search'}
        </button>
        <button
          onClick={resetVisualization}
          disabled={searching}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: searching ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: searching ? 'not-allowed' : 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Result Message */}
      {(found !== null || notFound) && (
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px 24px',
          background: found !== null ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
          borderRadius: '10px',
          border: `1px solid ${found !== null ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`,
          color: found !== null ? '#22c55e' : '#f87171',
          fontSize: '16px',
          fontWeight: 600
        }}>
          {found !== null 
            ? `✓ Found ${target} at index ${found}` 
            : `✗ ${target} not found in array`}
        </div>
      )}

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
        gap: '8px',
        height: '200px',
        padding: '32px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {array.map((value: number, index: number) => {
          const style = getBarStyle(index)
          
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
                  width: '36px',
                  height: '60px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  ...style
                }}
              >
                {value}
              </div>
              <span style={{
                fontSize: '12px',
                color: index === mid ? '#fbbf24' : 'rgba(255,255,255,0.4)'
              }}>
                {index}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Search Range</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Middle Element</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Found</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Checked</span>
        </div>
      </div>

      {/* Variables Display */}
      {searching && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginTop: '24px',
          padding: '16px 32px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Low</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#3b82f6' }}>{low}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Mid</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#fbbf24' }}>{mid}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>High</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#3b82f6' }}>{high}</div>
          </div>
        </div>
      )}

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
          How Binary Search Works
        </h3>
        <p style={{ 
          fontSize: '14px', 
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.6)'
        }}>
          Binary Search works on sorted arrays by repeatedly dividing the search interval in half. 
          It compares the target value to the middle element of the array. If the target is not found, 
          it eliminates half of the remaining elements and continues searching in the appropriate half. 
          This makes it much faster than linear search with O(log n) time complexity.
        </p>
      </div>
    </div>
  )
}
