import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LeadDetailClient from '@/components/leads/LeadDetailClient'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: lead } = await supabase
    .from('leads')
    .select('*, profiles!leads_assigned_agent_fkey(id, full_name)')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*, profiles(full_name)')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('lead_id', id)
    .order('reminder_date', { ascending: false })

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name')

  return (
    <LeadDetailClient
      lead={lead}
      activities={activities || []}
      reminders={reminders || []}
      agents={agents || []}
      userId={user.id}
      isAdmin={profile?.role === 'admin'}
    />
  )
}
