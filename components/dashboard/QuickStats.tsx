export default function QuickStats({ totalLeads, wonLeads, pendingFollowUps }: {
  totalLeads: number; wonLeads: number; pendingFollowUps: number
}) {
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  return (
    <div className="grid-3" style={{ marginBottom: 28 }}>
      <div className="metric-card">
        <span className="metric-value" style={{ color: 'var(--accent-blue)' }}>{totalLeads}</span>
        <span className="metric-label">Total Leads</span>
      </div>
      <div className="metric-card">
        <span className="metric-value" style={{ color: 'var(--accent-green)' }}>{conversionRate}%</span>
        <span className="metric-label">Conversion</span>
      </div>
      <div className="metric-card">
        <span className="metric-value" style={{ color: pendingFollowUps > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
          {pendingFollowUps}
        </span>
        <span className="metric-label">Follow-ups</span>
      </div>
    </div>
  )
}
