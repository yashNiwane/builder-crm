import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LeadListClient from '@/components/leads/LeadListClient'

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; search?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('leads')
    .select('*, profiles!leads_assigned_agent_fkey(full_name)')
    .order('updated_at', { ascending: false })

  if (!isAdmin) query = query.eq('assigned_agent', user.id)
  if (params.status && params.status !== 'all') query = query.eq('status', params.status)
  if (params.search) query = query.or(`phone.ilike.%${params.search}%,name.ilike.%${params.search}%`)

  const { data: leads } = await query

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">{isAdmin ? 'All Leads' : 'My Leads'}</h1>
        <Link href="/leads/new" className="btn btn-primary btn-sm">+ Add Lead</Link>
      </div>
      <LeadListClient leads={leads || []} currentStatus={params.status || 'all'} currentSearch={params.search || ''} />
    </div>
  )
}
