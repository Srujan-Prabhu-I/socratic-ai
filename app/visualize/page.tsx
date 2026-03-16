'use client'

import { useState } from 'react'
import SortVisualizer from '@/components/SortVisualizer'
import BinarySearchVisualizer from '@/components/BinarySearchVisualizer'
import QuickSortVisualizer from '@/components/QuickSortVisualizer'
import GraphVisualizer from '@/components/GraphVisualizer'
import ReasoningTimeline from '@/components/ReasoningTimeline'

export default function VisualizePage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bubble-sort' | 'binary-search' | 'quicksort' | 'graph-bfs' | 'graph-dfs' | null>(null)
  const [steps, setSteps] = useState<string[]>([])

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
          Algorithm Visualizer
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
        padding: '48px 32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Algorithm Selector */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '48px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedAlgorithm('bubble-sort')}
            style={{
              background: selectedAlgorithm === 'bubble-sort' ? 'rgba(74,222,128,0.1)' : 'transparent',
              border: selectedAlgorithm === 'bubble-sort' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              color: selectedAlgorithm === 'bubble-sort' ? '#4ade80' : 'rgba(255,255,255,0.8)',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Bubble Sort
          </button>
          <button
            onClick={() => setSelectedAlgorithm('binary-search')}
            style={{
              background: selectedAlgorithm === 'binary-search' ? 'rgba(74,222,128,0.1)' : 'transparent',
              border: selectedAlgorithm === 'binary-search' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              color: selectedAlgorithm === 'binary-search' ? '#4ade80' : 'rgba(255,255,255,0.8)',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Binary Search
          </button>
          <button
            onClick={() => setSelectedAlgorithm('quicksort')}
            style={{
              background: selectedAlgorithm === 'quicksort' ? 'rgba(74,222,128,0.1)' : 'transparent',
              border: selectedAlgorithm === 'quicksort' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              color: selectedAlgorithm === 'quicksort' ? '#4ade80' : 'rgba(255,255,255,0.8)',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            QuickSort
          </button>
          <button
            onClick={() => setSelectedAlgorithm('graph-bfs')}
            style={{
              background: selectedAlgorithm === 'graph-bfs' ? 'rgba(74,222,128,0.1)' : 'transparent',
              border: selectedAlgorithm === 'graph-bfs' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              color: selectedAlgorithm === 'graph-bfs' ? '#4ade80' : 'rgba(255,255,255,0.8)',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Graph BFS
          </button>
          <button
            onClick={() => setSelectedAlgorithm('graph-dfs')}
            style={{
              background: selectedAlgorithm === 'graph-dfs' ? 'rgba(74,222,128,0.1)' : 'transparent',
              border: selectedAlgorithm === 'graph-dfs' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
              color: selectedAlgorithm === 'graph-dfs' ? '#4ade80' : 'rgba(255,255,255,0.8)',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Graph DFS
          </button>
        </div>

        {/* Visualization Area */}
        {!selectedAlgorithm && (
          <div style={{
            textAlign: 'center',
            padding: '120px 20px',
            color: 'rgba(255,255,255,0.4)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '18px' }}>
              Select an algorithm above to visualize
            </div>
          </div>
        )}

        {selectedAlgorithm && (
          <div style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Visualization Canvas */}
            <div style={{
              flex: '1',
              minWidth: '600px'
            }}>
              {selectedAlgorithm === 'bubble-sort' && <SortVisualizer onStep={(step) => setSteps(prev => [...prev, step])} />}
              {selectedAlgorithm === 'binary-search' && <BinarySearchVisualizer onStep={(step) => setSteps(prev => [...prev, step])} />}
              {selectedAlgorithm === 'quicksort' && <QuickSortVisualizer onStep={(step) => setSteps(prev => [...prev, step])} />}
              {(selectedAlgorithm === 'graph-bfs' || selectedAlgorithm === 'graph-dfs') && <GraphVisualizer traversal={selectedAlgorithm === 'graph-bfs' ? 'bfs' : 'dfs'} onStep={(step) => setSteps(prev => [...prev, step])} />}
            </div>

            {/* Reasoning Timeline Panel */}
            <div style={{
              width: '300px',
              minWidth: '300px'
            }}>
              <ReasoningTimeline steps={steps} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
