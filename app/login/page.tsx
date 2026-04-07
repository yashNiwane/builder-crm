'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'agent' } },
      })
      if (error) { setError(error.message); setLoading(false); return }

      setError('')
      if (data.session) {
        router.push('/')
        router.refresh()
      } else {
        alert('Check your email for the confirmation link!')
        setLoading(false)
        setIsSignUp(false) // toggle back to sign in
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="login-container relative overflow-hidden bg-[var(--bg-primary)]">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.15}
        duration={3}
        className="[mask-image:radial-gradient(100vw_circle_at_center,white,transparent)] inset-0 h-full w-full"
      />

      <div className="login-card animate-in relative z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 mt-12 w-full max-w-sm">
        <div className="login-logo text-center">
          <h1 className="text-2xl font-bold mb-2">Reveretech CRM</h1>
          <p className="text-[var(--text-muted)]">Real estate sales, simplified</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          {isSignUp && (
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className="input"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <ShimmerButton type="submit" disabled={loading} className="w-full text-sm font-semibold" background="var(--bg-primary)" shimmerColor="var(--accent-blue)">
            <span className="z-10 whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </span>
          </ShimmerButton>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  )
}
