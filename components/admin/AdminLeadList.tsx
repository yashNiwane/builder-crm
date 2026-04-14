'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Download } from 'lucide-react'
import ImportLeadsModal from '../leads/ImportLeadsModal'

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', site_visit: 'Site Visit',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
}

interface Lead {
  id: string; name: string; phone: string; status: string; assigned_agent: string | null;
  interest: string | null; created_at: string;
  profiles: { id: string; full_name: string } | null
}

export default function AdminLeadList({ leads, agents }: { leads: Lead[]; agents: { id: string; full_name: string }[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAgent, setBulkAgent] = useState('')
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)

  const [optimisticLeads, setOptimisticLeads] = useState<Lead[]>(leads)
  useEffect(() => {
    setOptimisticLeads(leads)
  }, [leads])

  const filtered = optimisticLeads.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search)
    const matchAgent = !agentFilter || l.assigned_agent === agentFilter
    return matchSearch && matchAgent
  })

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(l => l.id)))
    }
  }

  async function reassign(leadId: string, agentId: string) {
    setOptimisticLeads(prev => prev.map(l => l.id === leadId ? { ...l, assigned_agent: agentId || null } : l))
    await supabase.from('leads').update({ assigned_agent: agentId || null }).eq('id', leadId)
    router.refresh()
  }

  async function bulkAssign() {
    if (selectedIds.size === 0) return
    setIsBulkAssigning(true)
    const agentLabel = bulkAgent || null
    setOptimisticLeads(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, assigned_agent: agentLabel } : l))

    
    // Batch update using supabase `in` filter
    await supabase
      .from('leads')
      .update({ assigned_agent: bulkAgent || null })
      .in('id', Array.from(selectedIds))

    setSelectedIds(new Set())
    setBulkAgent('')
    setIsBulkAssigning(false)
    router.refresh()
  }

  return (
    <>
      <ImportLeadsModal isOpen={showImport} onClose={() => setShowImport(false)} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 150, margin: 0 }}>
          <Search size={18} />
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{ minWidth: 120 }}>
          <option value="">All Agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
        </select>
        <button onClick={() => setShowImport(true)} className="btn btn-secondary">
          <Download size={16} /> Import
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="checkbox" 
            checked={filtered.length > 0 && selectedIds.size === filtered.length}
            onChange={toggleSelectAll}
            style={{ width: 16, height: 16 }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filtered.length} leads`}
          </span>
        </div>
        
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--accent-blue)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Bulk Action:</span>
            <select value={bulkAgent} onChange={(e) => setBulkAgent(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto' }}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
            </select>
            <button onClick={bulkAssign} disabled={isBulkAssigning} className="btn btn-primary btn-sm" style={{ padding: '4px 12px', minHeight: 'auto', fontSize: '0.75rem' }}>
              {isBulkAssigning ? '...' : 'Assign'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((lead) => (
          <div key={lead.id} className={`card ${selectedIds.has(lead.id) ? 'selected' : ''}`} style={{ padding: '14px 16px', border: selectedIds.has(lead.id) ? '1px solid var(--accent-blue)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(lead.id)} 
                  onChange={() => toggleSelect(lead.id)}
                  style={{ width: 16, height: 16, marginTop: 2 }}
                />
                <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
                </Link>
              </div>
              <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 28 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Assign:</span>
              <select
                value={lead.assigned_agent || ''}
                onChange={(e) => reassign(lead.id, e.target.value)}
                style={{ flex: 1, minHeight: 36, fontSize: '0.8125rem' }}
              >
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
