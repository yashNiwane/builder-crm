'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { KeyRound, ShieldCheck } from 'lucide-react'

export default function BuilderLogin() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [pwd, setPwd] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('builder_auth')
      if (isAuth === 'true') {
        router.push('/builder/dashboard')
      }
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (id === 'admin07' && pwd === 'admin07') {
      localStorage.setItem('builder_auth', 'true')
      router.push('/builder/dashboard')
      toast.success('Welcome to Builder Portal')
    } else {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafdfc] dark:bg-[#020813] font-sans overflow-hidden relative transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#11a277]/10 dark:bg-[#11a277]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0a2845]/5 dark:bg-[#0a2845]/40 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-white/50 dark:border-white/10 shadow-[0_8px_40px_rgba(17,162,119,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8">
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-tr from-[#11a277] to-[#2cd6a3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#11a277]/20 dark:shadow-[#11a277]/10 mb-6"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2845] dark:text-white">Builder Portal</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Secure entry required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="ID Number"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full h-14 bg-white/50 dark:bg-black/40 rounded-xl px-4 text-[15px] font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#11a277]/50 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-[#11a277]/10 dark:focus:ring-[#11a277]/20 transition-all"
                  required
                />
              </div>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="Passcode"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full h-14 bg-white/50 dark:bg-black/40 rounded-xl px-4 text-[15px] font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#11a277]/50 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-[#11a277]/10 dark:focus:ring-[#11a277]/20 transition-all z-10 relative"
                  required
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="relative w-full h-14 bg-[#0a2845] dark:bg-white text-white dark:text-[#0a2845] rounded-xl text-[15px] font-bold overflow-hidden shadow-xl shadow-[#0a2845]/10 flex items-center justify-center gap-2 group"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#11a277] to-[#20b889]"
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '0%' : '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <span className="relative z-10 group-hover:text-white transition-colors">Access Portal</span>
              <KeyRound className="relative z-10 w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:text-white transition-all" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
