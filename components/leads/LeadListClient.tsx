'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, Download, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import ImportLeadsModal from './ImportLeadsModal'

const STATUS_LABELS: Record<string, string> = {
  all: 'All', new: 'New', contacted: 'Contacted', site_visit: 'Site Visit',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
}
const STATUSES = ['all', 'new', 'contacted', 'site_visit', 'negotiation', 'closed_won', 'closed_lost']

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

interface Lead {
  id: string; name: string; phone: string; status: string;
  interest: string | null; source: string | null; budget_min: number | null;
  budget_max: number | null; updated_at: string;
  profiles: { full_name: string } | null;
}

export default function LeadListClient({ leads, currentStatus, currentSearch }: {
  leads: Lead[]; currentStatus: string; currentSearch: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [showImport, setShowImport] = useState(false)

  const updateUrl = useCallback((status: string, searchVal: string) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (searchVal) params.set('search', searchVal)
    router.push(`/leads?${params.toString()}`)
  }, [router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateUrl(currentStatus, search)
  }

  return (
    <>
      <ImportLeadsModal isOpen={showImport} onClose={() => setShowImport(false)} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
         <form onSubmit={handleSearch} style={{ flex: 1 }}>
           <div className="search-bar" style={{ margin: 0 }}>
             <Search size={18} />
             <input
               type="text"
               placeholder="Search name or phone..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
             {search && (
              <button type="button" onClick={() => { setSearch(''); updateUrl(currentStatus, '') }} className="btn btn-ghost btn-sm" style={{ padding: '4px', minHeight: 'auto' }}>
                <X size={16} />
              </button>
             )}
           </div>
         </form>
         <button onClick={() => setShowImport(true)} className="btn btn-secondary" style={{ padding: '0 12px' }}>
           <Download size={16} /> Import
         </button>
      </div>

      <div className="filter-chips" style={{ marginBottom: 16 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-chip ${currentStatus === s ? 'active' : ''}`}
            onClick={() => updateUrl(s, search)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {leads.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
          <p>No leads found. Try adjusting your filters.</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.map((lead) => (
            <motion.div key={lead.id} variants={item}>
              <Link href={`/leads/${lead.id}`} className="lead-card">
                <div className="lead-card-header">
                  <div>
                    <div className="lead-card-name">{lead.name}</div>
                    <div className="lead-card-phone"><Phone size={12} style={{ marginRight: 4 }} />{lead.phone}</div>
                  </div>
                  <span className={`badge badge-${lead.status}`}>
                    {STATUS_LABELS[lead.status] || lead.status}
                  </span>
                </div>
                <div className="lead-card-meta">
                  {lead.interest && <span className="lead-card-tag">{lead.interest}</span>}
                  {lead.source && <span className="lead-card-tag">{lead.source}</span>}
                  {lead.budget_max && <span className="lead-card-tag">₹{(lead.budget_max / 100000).toFixed(0)}L</span>}
                  {lead.profiles?.full_name && (
                    <span className="lead-card-tag" style={{ background: 'rgba(99,145,255,0.1)', color: 'var(--accent-blue)' }}>
                      {lead.profiles.full_name}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  )
}
