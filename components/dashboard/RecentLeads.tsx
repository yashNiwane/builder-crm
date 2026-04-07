import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', site_visit: 'Site Visit',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
}

interface Lead {
  id: string; name: string; phone: string; status: string;
  interest: string | null; source: string | null; updated_at: string;
}

export default function RecentLeads({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <p>No leads yet. Tap + to add your first lead!</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {leads.map((lead) => (
        <Link key={lead.id} href={`/leads/${lead.id}`} className="lead-card">
          <div className="lead-card-header">
            <div>
              <div className="lead-card-name">{lead.name}</div>
              <div className="lead-card-phone">📱 {lead.phone}</div>
            </div>
            <span className={`badge badge-${lead.status}`}>
              {STATUS_LABELS[lead.status] || lead.status}
            </span>
          </div>
          <div className="lead-card-meta">
            {lead.interest && <span className="lead-card-tag">{lead.interest}</span>}
            {lead.source && <span className="lead-card-tag">{lead.source}</span>}
            <span className="lead-card-tag" style={{ marginLeft: 'auto', fontSize: '0.6875rem' }}>
              {new Date(lead.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
