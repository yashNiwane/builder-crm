'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Phone, ArrowLeftRight, FileText, UserPlus, Sparkles, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'var(--status-new)' },
  contacted: { label: 'Contacted', color: 'var(--status-contacted)' },
  site_visit: { label: 'Site Visit', color: 'var(--status-site-visit)' },
  negotiation: { label: 'Negotiation', color: 'var(--status-negotiation)' },
  closed_won: { label: 'Won', color: 'var(--status-won)' },
  closed_lost: { label: 'Lost', color: 'var(--status-lost)' },
}
const STATUSES = Object.keys(STATUS_CONFIG)

const TYPE_ICONS: Record<string, React.ReactNode> = {
  status_change: <ArrowLeftRight size={14} />, 
  note: <FileText size={14} />, 
  call: <Phone size={14} />, 
  reassignment: <UserPlus size={14} />, 
  created: <Sparkles size={14} />,
}

interface Props {
  lead: any; activities: any[]; reminders: any[]; agents: any[]; userId: string; isAdmin: boolean
}

export default function LeadDetailClient({ lead, activities, reminders, agents, userId, isAdmin }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [noteText, setNoteText] = useState('')
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    if (newStatus === lead.status) return
    setLoading(true)
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id)
    if (error) toast.error('Failed to update status')
    else toast.success('Status updated')
    router.refresh()
    setLoading(false)
  }

  async function addNote() {
    if (!noteText.trim()) return
    setLoading(true)
    const { error } = await supabase.from('lead_activities').insert({
      lead_id: lead.id, user_id: userId, type: 'note', note: noteText,
    })
    if (error) toast.error('Failed to add note')
    else toast.success('Note added')
    setNoteText(''); setShowNoteForm(false)
    router.refresh()
    setLoading(false)
  }

  async function logCall() {
    setLoading(true)
    const { error } = await supabase.from('lead_activities').insert({
      lead_id: lead.id, user_id: userId, type: 'call', note: 'Phone call made',
    })
    if (error) toast.error('Failed to log call')
    else toast.success('Call logged')
    router.refresh()
    setLoading(false)
  }

  async function addReminder() {
    if (!reminderTitle.trim() || !reminderDate) return
    setLoading(true)
    const { error } = await supabase.from('reminders').insert({
      lead_id: lead.id, user_id: userId,
      reminder_date: new Date(reminderDate).toISOString(), title: reminderTitle,
    })
    if (error) toast.error('Failed to set reminder')
    else toast.success('Reminder set')
    setReminderTitle(''); setReminderDate(''); setShowReminderForm(false)
    router.refresh()
    setLoading(false)
  }

  async function reassignLead(agentId: string) {
    setLoading(true)
    const { error } = await supabase.from('leads').update({ assigned_agent: agentId }).eq('id', lead.id)
    if (error) toast.error('Failed to reassign lead')
    else toast.success('Lead reassigned')
    router.refresh()
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="page-container" style={{ padding: 0 }}>
      <div className="page-header">
        <div>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 8, padding: '4px 0' }}>
            <ArrowLeft size={16} style={{ marginRight: 4 }} /> Back
          </button>
          <h1 className="page-title">{lead.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Phone size={14} /> {lead.phone}
          </p>
        </div>
      </div>

      {/* Call button */}
      <a href={`tel:${lead.phone}`} className="call-btn" onClick={() => logCall()} style={{ marginBottom: 20, display: 'flex' }}>
        <Phone size={18} /> Call {lead.name}
      </a>

      {/* Status pipeline */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 12 }}>Pipeline Status</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`status-btn ${lead.status === s ? 'active' : ''}`}
              data-status={s}
              onClick={() => updateStatus(s)}
              disabled={loading}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </section>

      {/* Lead info */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 12 }}>Details</h3>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interest</span><br/>{lead.interest || '—'}</div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source</span><br/>{lead.source || '—'}</div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</span><br/>
            {lead.budget_min || lead.budget_max ? `₹${lead.budget_min ? (lead.budget_min/100000).toFixed(0) + 'L' : '?'} – ₹${lead.budget_max ? (lead.budget_max/100000).toFixed(0) + 'L' : '?'}` : '—'}
          </div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</span><br/>{lead.email || '—'}</div>
          <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned To</span><br/>
            {isAdmin ? (
              <select value={lead.assigned_agent || ''} onChange={(e) => reassignLead(e.target.value)} style={{ marginTop: 4 }}>
                <option value="">Unassigned</option>
                {agents.map((a: any) => <option key={a.id} value={a.id}>{a.full_name} {a.role === 'admin' ? '(Admin)' : ''}</option>)}
              </select>
            ) : (
              lead.profiles?.full_name || 'Unassigned'
            )}
          </div>
          {lead.notes && <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notes</span><br/>{lead.notes}</div>}
        </div>
      </section>

      {/* Quick actions */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 12 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNoteForm(!showNoteForm)}>
            <FileText size={14} /> Add Note
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReminderForm(!showReminderForm)}>
            <Clock size={14} /> Set Reminder
          </button>
        </div>

        {showNoteForm && (
          <div className="card" style={{ marginTop: 12 }}>
            <textarea placeholder="Type your note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={addNote} disabled={loading || !noteText.trim()}>Save Note</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNoteForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showReminderForm && (
          <div className="card" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className="input" type="text" placeholder="Reminder title" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} />
            <input className="input" type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={addReminder} disabled={loading || !reminderTitle.trim() || !reminderDate}>Save Reminder</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReminderForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {/* Reminders */}
      {reminders.length > 0 && (
        <section className="section">
          <h3 className="section-title" style={{ marginBottom: 12 }}>Reminders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reminders.map((r: any) => (
              <div key={r.id} className="task-card">
                <span className={`task-checkbox ${r.is_completed ? 'completed' : ''}`}>{r.is_completed ? '✓' : ''}</span>
                <div className="task-card-content">
                  <div className="task-card-title" style={{ textDecoration: r.is_completed ? 'line-through' : 'none' }}>{r.title}</div>
                  <div className="task-card-sub">
                    {new Date(r.reminder_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity timeline */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 12 }}>Activity Timeline</h3>
        {activities.length === 0 ? (
          <div className="empty-state"><p>No activity yet.</p></div>
        ) : (
          <div className="timeline">
            {activities.map((a: any) => (
              <div key={a.id} className="timeline-item">
                <div className={`timeline-dot ${a.type}`}>{TYPE_ICONS[a.type] || '•'}</div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    {a.type === 'status_change' && `Status changed: ${STATUS_CONFIG[a.old_value]?.label || a.old_value} → ${STATUS_CONFIG[a.new_value]?.label || a.new_value}`}
                    {a.type === 'note' && 'Note added'}
                    {a.type === 'call' && 'Phone call'}
                    {a.type === 'reassignment' && 'Lead reassigned'}
                    {a.type === 'created' && 'Lead created'}
                  </div>
                  {a.note && <div className="timeline-note">{a.note}</div>}
                  <div className="timeline-time">
                    {a.profiles?.full_name && `${a.profiles.full_name} • `}
                    {new Date(a.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
