import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TaskList from '@/components/dashboard/TaskList'
import RecentLeads from '@/components/dashboard/RecentLeads'
import QuickStats from '@/components/dashboard/QuickStats'
import { SparklesText } from '@/components/magicui/sparkles-text'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles').select('full_name, role').eq('id', user.id).single()

  const isAdmin = profile?.role === 'admin'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  // Today's reminders
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

  const remindersQuery = supabase
    .from('reminders')
    .select('*, leads(id, name, phone, status)')
    .gte('reminder_date', todayStart.toISOString())
    .lte('reminder_date', todayEnd.toISOString())
    .order('reminder_date', { ascending: true })

  if (!isAdmin) remindersQuery.eq('user_id', user.id)
  const { data: reminders } = await remindersQuery

  // Overdue reminders
  const overdueQuery = supabase
    .from('reminders')
    .select('*, leads(id, name, phone, status)')
    .lt('reminder_date', todayStart.toISOString())
    .eq('is_completed', false)
    .order('reminder_date', { ascending: true })
    .limit(10)

  if (!isAdmin) overdueQuery.eq('user_id', user.id)
  const { data: overdueReminders } = await overdueQuery

  // Recent leads
  const leadsQuery = supabase
    .from('leads')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(8)

  if (!isAdmin) leadsQuery.eq('assigned_agent', user.id)
  const { data: recentLeads } = await leadsQuery

  // Stats
  const statsQuery = supabase.from('leads').select('status', { count: 'exact' })
  if (!isAdmin) statsQuery.eq('assigned_agent', user.id)
  const { count: totalLeads } = await statsQuery

  const wonQuery = supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'closed_won')
  if (!isAdmin) wonQuery.eq('assigned_agent', user.id)
  const { count: wonLeads } = await wonQuery

  const pendingQuery = supabase.from('reminders').select('id', { count: 'exact' }).eq('is_completed', false)
  if (!isAdmin) pendingQuery.eq('user_id', user.id)
  const { count: pendingFollowUps } = await pendingQuery

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <SparklesText text={`Hey, ${firstName} 👋`} as="h1" className="page-title !tracking-tight pr-4" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <QuickStats totalLeads={totalLeads || 0} wonLeads={wonLeads || 0} pendingFollowUps={pendingFollowUps || 0} />

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start lg:mt-6">
        <div className="flex flex-col gap-6">
          {(overdueReminders && overdueReminders.length > 0) && (
            <section className="section !mt-0 !mb-0">
              <div className="section-header">
                <h2 className="section-title" style={{ color: 'var(--accent-red)' }}>⚠ Overdue</h2>
              </div>
              <TaskList reminders={overdueReminders} type="overdue" />
            </section>
          )}

          <section className="section !mt-0 !mb-0">
            <div className="section-header">
              <h2 className="section-title">Today&apos;s Tasks</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {reminders?.length || 0} tasks
              </span>
            </div>
            <TaskList reminders={reminders || []} type="today" />
          </section>
        </div>

        <section className="section !mt-0">
          <div className="section-header">
            <h2 className="section-title">Recent Leads</h2>
            <Link href="/leads" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <RecentLeads leads={recentLeads || []} />
        </section>
      </div>

      <Link href="/leads/new" className="fab" aria-label="Add Lead">＋</Link>
    </div>
  )
}
