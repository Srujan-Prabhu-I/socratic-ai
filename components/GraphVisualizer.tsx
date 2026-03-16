'use client'

import { useState, useCallback } from 'react'

const graph: Record<string, string[]> = {
  A: ['B', 'D'],
  B: ['C', 'E'],
  C: [],
  D: [],
  E: []
}

const nodePositions: Record<string, { x: number; y: number }> = {
  A: { x: 200, y: 50 },
  B: { x: 350, y: 50 },
  C: { x: 500, y: 50 },
  D: { x: 200, y: 200 },
  E: { x: 350, y: 200 }
}

const edges = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'D' },
  { from: 'B', to: 'C' },
  { from: 'B', to: 'E' }
]

interface GraphVisualizerProps {
  onStep?: (step: string) => void
  traversal?: 'bfs' | 'dfs' | null
}

export default function GraphVisualizer({ onStep, traversal: initialTraversal = null }: GraphVisualizerProps) {
  const [traversal, setTraversal] = useState<'bfs' | 'dfs' | null>(initialTraversal)
  const [running, setRunning] = useState(false)
  const [visited, setVisited] = useState<string[]>([])
  const [current, setCurrent] = useState<string | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [speed, setSpeed] = useState(1000)
  const [explanation, setExplanation] = useState("Select BFS or DFS to start graph traversal.")

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const resetVisualization = () => {
    setVisited([])
    setCurrent(null)
    setCompleted([])
    setRunning(false)
    setExplanation("Select BFS or DFS to start graph traversal.")
  }

  const bfs = useCallback(async () => {
    setRunning(true)
    setExplanation("Starting BFS traversal...")
    onStep?.("Starting BFS traversal...")
    
    const queue = ['A']
    const visitedSet = new Set<string>()
    const visitedOrder: string[] = []
    
    while (queue.length > 0) {
      const node = queue.shift()!
      
      if (!visitedSet.has(node)) {
        setCurrent(node)
        setExplanation(`Visiting node ${node} (using Queue)`)
        onStep?.(`Visiting node ${node}`)
        await sleep(speed)
        
        visitedSet.add(node)
        visitedOrder.push(node)
        setVisited([...visitedOrder])
        
        setExplanation(`Adding neighbors of ${node} to queue: ${graph[node].join(', ')}`)
        onStep?.(`Adding neighbors of ${node} to queue`)
        await sleep(speed / 2)
        
        for (const neighbor of graph[node]) {
          if (!visitedSet.has(neighbor)) {
            queue.push(neighbor)
          }
        }
        
        setCompleted(prev => [...prev, node])
        setCurrent(null)
        await sleep(speed / 2)
      }
    }
    
    setExplanation(`BFS traversal complete! Order: ${visitedOrder.join(' → ')}`)
    onStep?.(`BFS traversal complete!`)
    setRunning(false)
  }, [speed, onStep])

  const dfs = useCallback(async () => {
    setRunning(true)
    setExplanation("Starting DFS traversal...")
    onStep?.("Starting DFS traversal...")
    
    const stack = ['A']
    const visitedSet = new Set<string>()
    const visitedOrder: string[] = []
    
    while (stack.length > 0) {
      const node = stack.pop()!
      
      if (!visitedSet.has(node)) {
        setCurrent(node)
        setExplanation(`Visiting node ${node} (using Stack)`)
        onStep?.(`Visiting node ${node}`)
        await sleep(speed)
        
        visitedSet.add(node)
        visitedOrder.push(node)
        setVisited([...visitedOrder])
        
        setExplanation(`Adding neighbors of ${node} to stack: ${graph[node].join(', ')}`)
        onStep?.(`Adding neighbors of ${node} to stack`)
        await sleep(speed / 2)
        
        for (let i = graph[node].length - 1; i >= 0; i--) {
          const neighbor = graph[node][i]
          if (!visitedSet.has(neighbor)) {
            stack.push(neighbor)
          }
        }
        
        setCompleted(prev => [...prev, node])
        setCurrent(null)
        await sleep(speed / 2)
      }
    }
    
    setExplanation(`DFS traversal complete! Order: ${visitedOrder.join(' → ')}`)
    onStep?.(`DFS traversal complete!`)
    setRunning(false)
  }, [speed, onStep])

  const startTraversal = async () => {
    resetVisualization()
    await sleep(100)
    
    if (traversal === 'bfs') {
      await bfs()
    } else if (traversal === 'dfs') {
      await dfs()
    }
  }

  const getNodeStyle = (node: string) => {
    const isVisited = visited.includes(node)
    const isCurrent = current === node
    const isCompleted = completed.includes(node)
    
    if (isCurrent) {
      return {
        background: '#fbbf24',
        boxShadow: '0 0 30px rgba(251,191,36,0.6)',
        transform: 'scale(1.2)'
      }
    }
    
    if (isCompleted) {
      return {
        background: '#22c55e',
        boxShadow: '0 0 20px rgba(34,197,94,0.4)'
      }
    }
    
    if (isVisited) {
      return {
        background: '#3b82f6',
        boxShadow: '0 0 15px rgba(59,130,246,0.4)'
      }
    }
    
    return {
      background: 'rgba(255,255,255,0.1)',
      boxShadow: 'none'
    }
  }

  return (
    <div>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setTraversal('bfs')}
          disabled={running}
          style={{
            background: traversal === 'bfs' ? '#3b82f6' : 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: traversal === 'bfs' ? '#fff' : 'rgba(255,255,255,0.8)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          BFS
        </button>
        <button
          onClick={() => setTraversal('dfs')}
          disabled={running}
          style={{
            background: traversal === 'dfs' ? '#3b82f6' : 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: traversal === 'dfs' ? '#fff' : 'rgba(255,255,255,0.8)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          DFS
        </button>
        
        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
        
        <button
          onClick={startTraversal}
          disabled={running || !traversal}
          style={{
            background: running ? 'rgba(255,255,255,0.05)' : '#4ade80',
            border: 'none',
            color: running ? 'rgba(255,255,255,0.4)' : '#000',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: running || !traversal ? 'not-allowed' : 'pointer'
          }}
        >
          {running ? 'Traversing...' : 'Start Traversal'}
        </button>
        <button
          onClick={resetVisualization}
          disabled={running}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: running ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <label style={{ marginBottom: "6px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
          Animation Speed
        </label>
        <input
          type="range"
          min="500"
          max="1500"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
          style={{ width: "220px" }}
        />
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

      {/* Graph Visualization */}
      <div style={{
        position: 'relative',
        width: '600px',
        height: '300px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Edges */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {edges.map((edge, i) => {
            const from = nodePositions[edge.from]
            const to = nodePositions[edge.to]
            return (
              <line
                key={i}
                x1={from.x + 25}
                y1={from.y + 25}
                x2={to.x + 25}
                y2={to.y + 25}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {Object.entries(nodePositions).map(([node, pos]) => {
          const style = getNodeStyle(node)
          return (
            <div
              key={node}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff',
                transition: 'all 0.3s ease',
                ...style
              }}
            >
              {node}
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
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Visited</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fbbf24' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Completed</span>
        </div>
      </div>
    </div>
  )
}
