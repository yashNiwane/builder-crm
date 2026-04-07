import React from 'react'
import { motion } from 'framer-motion'

export function Skeleton({ className = '', style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        ...style,
        minHeight: style?.height || style?.minHeight || '20px',
        width: style?.width || '100%',
        borderRadius: style?.borderRadius || 'var(--radius-md)',
      }}
    />
  )
}

export function LeadCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Skeleton style={{ height: '24px', width: '60%' }} />
          <Skeleton style={{ height: '16px', width: '40%' }} />
        </div>
        <Skeleton style={{ height: '28px', width: '80px', borderRadius: 'var(--radius-full)' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton style={{ height: '24px', width: '60px', borderRadius: 'var(--radius-full)' }} />
        <Skeleton style={{ height: '24px', width: '80px', borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  )
}
