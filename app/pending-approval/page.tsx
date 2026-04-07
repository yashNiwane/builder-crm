import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('approval_status, admin_id').eq('id', user.id).single()
  
  if (profile?.approval_status === 'approved') redirect('/')
  if (!profile?.admin_id) redirect('/onboarding')

  return (
    <div className="login-container relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="login-card animate-in relative z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 mt-12 w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-100/50 dark:bg-amber-900/50 flex flex-col items-center justify-center text-amber-500 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[var(--accent-amber)]">Approval Pending</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
          Your account is currently waiting for administrator approval. You will gain access to the CRM once your admin reviews your request.
        </p>

        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-secondary w-full">Sign Out & Return Later</button>
        </form>
      </div>
    </div>
  )
}
