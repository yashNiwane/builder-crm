import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLeadList from '@/components/admin/AdminLeadList'

export default async function AdminLeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: leads } = await supabase
    .from('leads')
    .select('*, profiles!leads_assigned_agent_fkey(id, full_name)')
    .order('created_at', { ascending: false })

  const { data: agents } = await supabase.from('profiles').select('id, full_name').order('full_name')

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Manage Leads</h1>
        <button onClick={() => {}} className="btn btn-ghost btn-sm" style={{ visibility: 'hidden' }}>_</button>
      </div>
      <AdminLeadList leads={leads || []} agents={agents || []} />
    </div>
  )
}
