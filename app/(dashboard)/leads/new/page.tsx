'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SOURCES = ['Walk-in', 'Online', 'Referral', 'Ad Campaign', 'Social Media', 'Other']
const INTERESTS = ['1RK', '1BHK', '1.5BHK', '2BHK', '2.5BHK', '3BHK', '3.5BHK', '4BHK', '4.5BHK', '5BHK', '5.5BHK', 'Villa', 'Bungalow', 'Plot', 'Commercial', 'Other']

export default function NewLeadPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dupWarning, setDupWarning] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', email: '', interest: '', budget_min: '', budget_max: '',
    source: '', notes: '', follow_up_date: '',
  })

  function updateForm(field: string, value: string) {
    setForm({ ...form, [field]: value })
  }

  async function checkDuplicate(phone: string) {
    if (phone.length < 10) { setDupWarning(''); return }
    const { data } = await supabase.from('leads').select('id, name').eq('phone', phone).maybeSingle()
    if (data) setDupWarning(`Duplicate! Lead "${data.name}" already exists with this phone.`)
    else setDupWarning('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (dupWarning) return
    setLoading(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const leadData = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      interest: form.interest || null,
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      source: form.source || null,
      notes: form.notes || null,
      follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
      assigned_agent: user.id,
      created_by: user.id,
      status: 'new' as const,
    }

    const { data: lead, error: insertError } = await supabase.from('leads').insert(leadData).select().single()

    if (insertError) {
      if (insertError.code === '23505') setError('A lead with this phone number already exists.')
      else setError(insertError.message)
      setLoading(false); return
    }

    // Log creation activity
    await supabase.from('lead_activities').insert({
      lead_id: lead.id, user_id: user.id, type: 'created', new_value: form.name, note: 'Lead created',
    })

    // Create reminder if follow-up date set
    if (form.follow_up_date) {
      await supabase.from('reminders').insert({
        lead_id: lead.id, user_id: user.id,
        reminder_date: new Date(form.follow_up_date).toISOString(),
        title: `Follow up with ${form.name}`,
      })
    }

    router.push(`/leads/${lead.id}`)
    router.refresh()
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Add Lead</h1>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:max-w-4xl">
        {error && <div className="login-error lg:col-span-2">{error}</div>}

        <div className="input-group">
          <label htmlFor="name">Name *</label>
          <input id="name" className="input" type="text" placeholder="Lead name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required />
        </div>

        <div className="input-group">
          <label htmlFor="phone">Phone *</label>
          <input id="phone" className="input" type="tel" placeholder="10-digit mobile number" value={form.phone}
            onChange={(e) => { updateForm('phone', e.target.value); checkDuplicate(e.target.value) }} required />
          {dupWarning && <span style={{ color: 'var(--accent-red)', fontSize: '0.8125rem' }}>{dupWarning}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="interest">Interest</label>
          <select id="interest" value={form.interest} onChange={(e) => updateForm('interest', e.target.value)}>
            <option value="">Select interest</option>
            {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group">
            <label htmlFor="budget_min">Budget Min (₹)</label>
            <input id="budget_min" className="input" type="number" placeholder="e.g. 3000000" value={form.budget_min} onChange={(e) => updateForm('budget_min', e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="budget_max">Budget Max (₹)</label>
            <input id="budget_max" className="input" type="number" placeholder="e.g. 5000000" value={form.budget_max} onChange={(e) => updateForm('budget_max', e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="source">Source</label>
          <select id="source" value={form.source} onChange={(e) => updateForm('source', e.target.value)}>
            <option value="">Select source</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="input-group lg:col-span-1">
          <label htmlFor="follow_up">Follow-up Date</label>
          <input id="follow_up" className="input" type="datetime-local" value={form.follow_up_date} onChange={(e) => updateForm('follow_up_date', e.target.value)} />
        </div>

        <div className="input-group lg:col-span-2">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" placeholder="Any additional notes..." value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} />
        </div>

        <div className="lg:col-span-2">
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || !!dupWarning}>
            {loading ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
