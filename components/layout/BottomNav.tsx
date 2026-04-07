'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BarChart3, UserCircle, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/leads', label: 'Leads', icon: Users },
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: BarChart3 }] : []),
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Reveretech CRM</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 w-full">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Theme</span>
            <ThemeToggle />
          </div>
          <form action="/auth/signout" method="post" className="w-full">
            <button type="submit" className="sidebar-link w-full border-none bg-none font-[var(--font-body)] text-[0.9375rem] cursor-pointer text-left">
              <LogOut size={20} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav - Floating Glassmorphism Dock */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="flex items-center justify-around bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-full px-2 py-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-[var(--accent-blue)]/10 dark:bg-[var(--accent-blue)]/20 rounded-full"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <Icon 
                  size={20} 
                  className={`z-10 transition-colors duration-300 ${isActive ? 'text-[var(--accent-blue)]' : 'text-slate-500 dark:text-slate-400'}`}
                />
                <span className={`z-10 mt-1 text-[0.65rem] font-semibold transition-colors duration-300 ${isActive ? 'text-[var(--accent-blue)]' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
