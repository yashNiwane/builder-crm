import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, admin_id, approval_status')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'agent'

  if (role === 'agent') {
    if (!profile?.admin_id) {
      redirect('/onboarding')
    }
    if (profile?.approval_status !== 'approved') {
      redirect('/pending-approval')
    }
  }

  return (
    <>
      <BottomNav role={role} />
      <main className="page-container">
        {children}
      </main>
    </>
  )
}
