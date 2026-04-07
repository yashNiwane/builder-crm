'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({ ...data, email: user.email })
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    setSaving(false)
    router.refresh()
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:max-w-4xl mt-4">
        <div className="card flex items-center justify-between gap-4 mb-2 lg:col-span-2 lg:mb-4 lg:p-6 w-full">
          <div className="flex items-center gap-4">
            <div className="avatar avatar-blue" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {fullName?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-bold text-xl">{fullName || 'Unnamed'}</div>
              <div className="text-sm text-[var(--text-muted)]">{profile?.email}</div>
              <span className={`badge ${profile?.role === 'admin' ? 'badge-closed_won' : 'badge-new'} mt-2`}>
                {profile?.role}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="input-group">
          <label>Full Name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Phone</label>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
        </div>

        <div className="lg:col-span-1 mt-2">
          <button className="btn btn-primary w-full lg:text-base lg:py-3" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>

        <form action="/auth/signout" method="post" className="lg:col-span-1 lg:mt-2">
          <button type="submit" className="btn btn-danger w-full lg:text-base lg:py-3">Sign Out</button>
        </form>
      </div>
    </div>
  )
}
