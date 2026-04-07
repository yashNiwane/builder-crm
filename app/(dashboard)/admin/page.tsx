import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { BorderBeam } from '@/components/magicui/border-beam'

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', site_visit: 'Site Visit',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'var(--status-new)', contacted: 'var(--status-contacted)', site_visit: 'var(--status-site-visit)',
  negotiation: 'var(--status-negotiation)', closed_won: 'var(--status-won)', closed_lost: 'var(--status-lost)',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // All leads
  const { data: allLeads } = await supabase.from('leads').select('id, status, assigned_agent')
  const totalLeads = allLeads?.length || 0
  const wonLeads = allLeads?.filter(l => l.status === 'closed_won').length || 0
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  // Status funnel
  const statusCounts: Record<string, number> = {}
  allLeads?.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1 })
  const maxCount = Math.max(...Object.values(statusCounts), 1)

  // Agents performance
  const { data: agents } = await supabase.from('profiles').select('id, full_name, role')
  const agentStats = agents?.map(agent => {
    const agentLeads = allLeads?.filter(l => l.assigned_agent === agent.id) || []
    const won = agentLeads.filter(l => l.status === 'closed_won').length
    return {
      ...agent,
      totalLeads: agentLeads.length,
      wonLeads: won,
      conversion: agentLeads.length > 0 ? Math.round((won / agentLeads.length) * 100) : 0,
    }
  })?.sort((a, b) => b.totalLeads - a.totalLeads) || []

  // Missed follow-ups
  const { count: missedFollowUps } = await supabase
    .from('reminders')
    .select('id', { count: 'exact' })
    .lt('reminder_date', new Date().toISOString())
    .eq('is_completed', false)

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/agents" className="btn btn-secondary btn-sm">Agent Approvals</Link>
          <Link href="/admin/leads" className="btn btn-primary btn-sm">Manage Leads</Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="metric-card relative overflow-hidden">
          <span className="metric-value flex items-center" style={{ color: 'var(--accent-blue)' }}>
            <NumberTicker value={totalLeads} className="!text-[var(--accent-blue)] dark:!text-[var(--accent-blue)]" />
          </span>
          <span className="metric-label">Total Leads</span>
          <BorderBeam size={100} duration={8} delay={0} />
        </div>
        <div className="metric-card relative overflow-hidden">
          <span className="metric-value flex items-center" style={{ color: 'var(--accent-green)' }}>
            <NumberTicker value={conversionRate} className="!text-[var(--accent-green)] dark:!text-[var(--accent-green)]" />%
          </span>
          <span className="metric-label">Conversion</span>
          <BorderBeam size={100} duration={8} delay={3} />
        </div>
        <div className="metric-card relative overflow-hidden">
          <span className="metric-value flex items-center" style={{ color: 'var(--accent-cyan)' }}>
            <NumberTicker value={agents?.length || 0} className="!text-[var(--accent-cyan)] dark:!text-[var(--accent-cyan)]" />
          </span>
          <span className="metric-label">Team Size</span>
          <BorderBeam size={100} duration={8} delay={1.5} />
        </div>
        <div className="metric-card relative overflow-hidden">
          <span className="metric-value flex items-center" style={{ color: missedFollowUps ? 'var(--accent-red)' : 'var(--text-muted)' }}>
            <NumberTicker value={missedFollowUps || 0} className={missedFollowUps ? "!text-[var(--accent-red)] dark:!text-[var(--accent-red)]" : "!text-[var(--text-muted)] dark:!text-[var(--text-muted)]"} />
          </span>
          <span className="metric-label">Missed F/U</span>
          {missedFollowUps && missedFollowUps > 0 && <BorderBeam size={100} duration={5} colorFrom="#ef4444" colorTo="#b91c1c" />}
        </div>
      </div>

      {/* Funnel */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 14 }}>Lead Pipeline</h3>
        <div className="card">
          <div className="funnel">
            {['new', 'contacted', 'site_visit', 'negotiation', 'closed_won', 'closed_lost'].map(s => (
              <div key={s} className="funnel-row">
                <span className="funnel-label">{STATUS_LABELS[s]}</span>
                <div className="funnel-bar-bg">
                  <div className="funnel-bar" style={{
                    width: `${Math.max((statusCounts[s] || 0) / maxCount * 100, 5)}%`,
                    background: STATUS_COLORS[s],
                  }}>
                    {statusCounts[s] || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent table */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: 14 }}>Agent Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {agentStats.map((agent, i) => {
              const colors = ['avatar-blue', 'avatar-cyan', 'avatar-purple', 'avatar-amber']
              return (
                <div key={agent.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                  <div className={`avatar ${colors[i % colors.length]}`}>
                    {agent.full_name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{agent.full_name || 'Unnamed'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agent.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{agent.totalLeads}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>leads</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 50 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--accent-green)' }}>{agent.conversion}%</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>conv.</div>
                  </div>
                </div>
              )
            })}
            {agentStats.length === 0 && <div className="empty-state"><p>No agents yet.</p></div>}
          </div>
        </div>
      </section>
    </div>
  )
}
