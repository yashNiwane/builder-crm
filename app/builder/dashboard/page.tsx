'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LayoutDashboard, Building2, Plus, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import AddPropertyForm from '@/components/builder/AddPropertyForm'
import PropertyCatalog from '@/components/builder/PropertyCatalog'

export default function BuilderDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'catalog' | 'add'>('catalog')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const isAuth = localStorage.getItem('builder_auth')
    if (isAuth !== 'true') {
      router.push('/builder')
    }
  }, [router])

  if (!mounted) return null

  const handleLogout = () => {
    localStorage.removeItem('builder_auth')
    router.push('/builder')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen bg-[#f3f7f6] dark:bg-[#020813] font-sans text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-500">
      
      {/* Sidebar Navigation */}
      <aside className="w-[280px] bg-white dark:bg-[#0a1120] border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col justify-between shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-20 transition-colors">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-white/5">
            <div className="bg-gradient-to-tr from-[#11a277] to-[#15b283] p-2 rounded-xl shadow-lg shadow-[#11a277]/20 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[17px] font-extrabold tracking-tight text-[#0a2845] dark:text-white ml-3">Revere Builder</h1>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[15px] ${
                activeTab === 'catalog' 
                  ? 'bg-gradient-to-r from-[#11a277]/10 dark:from-[#11a277]/20 to-transparent text-[#11a277] border-l-4 border-[#11a277]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'catalog' ? 'text-[#11a277]' : 'text-slate-400 dark:text-slate-500'}`} />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[15px] ${
                activeTab === 'add' 
                  ? 'bg-gradient-to-r from-[#11a277]/10 dark:from-[#11a277]/20 to-transparent text-[#11a277] border-l-4 border-[#11a277]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <Plus className={`w-5 h-5 ${activeTab === 'add' ? 'text-[#11a277]' : 'text-slate-400 dark:text-slate-500'}`} />
              New Listing
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              Theme
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {theme}
            </span>
          </button>
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-transparent">
            <div className="w-10 h-10 rounded-full bg-[#0a2845] dark:bg-slate-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A7</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0a2845] dark:text-white">Admin 07</p>
              <p className="text-xs font-medium text-[#11a277]">Authorized</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-white dark:bg-[#0a1120] h-16 px-4 border-b border-slate-200 dark:border-white/5 z-20">
          <div className="bg-gradient-to-tr from-[#11a277] to-[#15b283] p-1.5 rounded-lg shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={() => setActiveTab('catalog')} className={`px-3 py-1.5 rounded-md text-sm font-bold ${activeTab === 'catalog' ? 'bg-[#11a277]/10 text-[#11a277]' : 'text-slate-500'}`}>Catalog</button>
            <button onClick={() => setActiveTab('add')} className={`px-3 py-1.5 rounded-md text-sm font-bold ${activeTab === 'add' ? 'bg-[#11a277]/10 text-[#11a277]' : 'text-slate-500'}`}>New</button>
          </div>
        </header>

        {/* Top App Bar Content (Desktop) */}
        <div className="hidden md:flex h-20 items-center justify-between px-8 z-10 w-full relative">
          <div className="absolute inset-0 bg-[#f3f7f6]/80 dark:bg-[#020813]/80 backdrop-blur-md pointer-events-none transition-colors" />
          <h2 className="text-2xl font-black text-[#0a2845] dark:text-white relative z-10 tracking-tight">
            {activeTab === 'catalog' ? 'Property Catalog' : 'Create New Listing'}
          </h2>
          {activeTab === 'catalog' && (
            <button
              onClick={() => setActiveTab('add')}
              className="relative z-10 flex items-center gap-2 h-11 px-6 bg-[#0a2845] dark:bg-white hover:bg-[#071f36] dark:hover:bg-slate-200 text-white dark:text-[#0a2845] font-bold text-sm tracking-wide rounded-[10px] shadow-[0_8px_20px_rgb(10,40,69,0.15)] transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto w-full relative z-0 pt-6 md:pt-0 pb-20 px-4 md:px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'catalog' ? (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-7xl mx-auto"
              >
                <PropertyCatalog />
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-7xl mx-auto"
              >
                <AddPropertyForm onSuccess={() => setActiveTab('catalog')} onCancel={() => setActiveTab('catalog')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
