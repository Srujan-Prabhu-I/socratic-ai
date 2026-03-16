'use client'

interface ReasoningTimelineProps {
  steps: string[]
}

export default function ReasoningTimeline({ steps }: ReasoningTimelineProps) {
  return (
    <div style={{
      padding: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h4 style={{
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '12px',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Reasoning Timeline
      </h4>
      
      {steps.length === 0 ? (
        <div style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic'
        }}>
          No steps recorded yet. Start the visualization to see the reasoning process.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                padding: '10px 12px',
                background: index === steps.length - 1 
                  ? 'rgba(74,222,128,0.1)' 
                  : 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                borderLeft: `3px solid ${index === steps.length - 1 ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.5'
              }}
            >
              <span style={{
                color: index === steps.length - 1 ? '#4ade80' : 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                marginRight: '8px'
              }}>
                Step {index + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
