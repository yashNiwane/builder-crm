'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'


interface Reminder {
  id: string; title: string; reminder_date: string; is_completed: boolean;
  leads: { id: string; name: string; phone: string; status: string } | null
}

export default function TaskList({ reminders, type }: { reminders: Reminder[]; type: 'today' | 'overdue' }) {
  const supabase = createClient()
  const router = useRouter()

  const [optimisticList, setOptimisticList] = useState<Reminder[]>(reminders)
  
  useEffect(() => {
    setOptimisticList(reminders)
  }, [reminders])

  async function toggleComplete(id: string, current: boolean) {
    // Optimistic update
    setOptimisticList((prev: Reminder[]) => prev.map(r => 
      r.id === id ? { ...r, is_completed: !current } : r
    ))

    const { error } = await supabase.from('reminders').update({
      is_completed: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }).eq('id', id)
    
    if (error) {
      // Revert if error
      setOptimisticList(reminders)
    } else {
      router.refresh()
    }
  }

  if (reminders.length === 0) {
    return (
      <div className="empty-state">
        <p>{type === 'today' ? '🎉 No tasks for today!' : 'All caught up!'}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {optimisticList.map((r) => (
        <div key={r.id} className={`task-card ${type === 'overdue' ? 'overdue' : 'today'}`}>
          <button
            className={`task-checkbox ${r.is_completed ? 'completed' : ''}`}
            onClick={() => toggleComplete(r.id, r.is_completed)}
            aria-label={r.is_completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {r.is_completed ? '✓' : ''}
          </button>
          <Link href={r.leads ? `/leads/${r.leads.id}` : '#'} className="task-card-content" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="task-card-title" style={{ textDecoration: r.is_completed ? 'line-through' : 'none', opacity: r.is_completed ? 0.5 : 1 }}>
              {r.title}
            </div>
            <div className="task-card-sub">
              {r.leads?.name} • {r.leads?.phone}
              {type === 'overdue' && ` • ${new Date(r.reminder_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
