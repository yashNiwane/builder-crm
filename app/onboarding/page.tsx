"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShimmerButton } from '@/components/magicui/shimmer-button'

export default function OnboardingPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadAdmins() {
      const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'admin')
      if (data) setAdmins(data)
      else console.error(error)
      setLoading(false)
    }
    loadAdmins()
  }, [supabase])

  const handleSelectAdmin = async () => {
    if (!selectedAdmin) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ admin_id: selectedAdmin }).eq('id', user.id)
    router.push('/pending-approval')
    router.refresh()
  }

  return (
    <div className="login-container relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="login-card animate-in relative z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 mt-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Select Your Admin</h1>
          <p className="text-[var(--text-muted)] text-sm">Please choose the Administrator you wish to map your account with. They will need to approve your registration.</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading available admins...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {admins.length === 0 ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm">
                No administrators found in the system. Contact support.
              </div>
            ) : (
              admins.map(admin => (
                <div 
                  key={admin.id} 
                  onClick={() => setSelectedAdmin(admin.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedAdmin === admin.id ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-glow)]' : 'border-[var(--border)] hover:border-[var(--accent-cyan)]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center font-bold text-slate-500">
                      {admin.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{admin.full_name || 'Admin'}</span>
                      <span className="text-xs text-[var(--text-muted)]">{admin.email}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAdmin === admin.id ? 'border-[var(--accent-blue)]' : 'border-[var(--border)]'}`}>
                    {selectedAdmin === admin.id && <div className="w-3 h-3 rounded-full bg-[var(--accent-blue)]" />}
                  </div>
                </div>
              ))
            )}

            <ShimmerButton 
              disabled={saving || !selectedAdmin} 
              onClick={handleSelectAdmin} 
              className="w-full mt-4" 
              background="var(--bg-primary)" 
              shimmerColor="var(--accent-blue)"
            >
              <span className="z-10 whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight text-white lg:text-base">
                {saving ? 'Saving...' : 'Confirm Selection'}
              </span>
            </ShimmerButton>
          </div>
        )}
      </div>
    </div>
  )
}
