'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, Variants } from 'framer-motion'
import { Building2, MapPin, Grid, Loader2, Search, SlidersHorizontal, Home } from 'lucide-react'

interface Property {
  id: string
  created_at: string
  category: string
  listing_type: string
  city: string
  area_locality: string
  subarea: string
  society_name: string
  property_type: string
  area_type: string
  area_value_sqft: number
  floor_number: number
  pricing: number
  available_from: string
  parking: string
  furnishing_status: string
  images: string[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function PropertyCatalog() {
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('builder_properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProperties(data)
    setLoading(false)
  }

  const filteredProperties = properties.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.city?.toLowerCase().includes(q) ||
      p.area_locality?.toLowerCase().includes(q) ||
      p.society_name?.toLowerCase().includes(q) ||
      p.property_type?.toLowerCase().includes(q)
    )
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === 'price_low') return a.pricing - b.pricing
    if (sortOption === 'price_high') return b.pricing - a.pricing
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/70 dark:bg-slate-900/40 p-4 rounded-3xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:w-[400px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full h-12 pl-12 pr-4 bg-white/80 dark:bg-black/50 rounded-2xl border border-slate-100 dark:border-white/5 text-[15px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#11a277]/10 focus:border-[#11a277]/30 transition-all shadow-inner"
            placeholder="Search localities, societies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-[220px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          </div>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full h-12 pl-10 pr-10 bg-white/80 dark:bg-black/50 rounded-2xl border border-slate-100 dark:border-white/5 text-[14px] font-semibold text-slate-700 dark:text-slate-200 appearance-none focus:outline-none focus:ring-4 focus:ring-[#11a277]/10 focus:border-[#11a277]/30 transition-all shadow-inner cursor-pointer"
          >
            <option value="newest">Recently Added</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <div className="w-2 h-2 border-b-2 border-r-2 border-slate-400 transform rotate-45 translate-y-[-2px]" />
          </div>
        </div>
      </motion.div>

      {/* Grid Content */}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
           <Loader2 className="w-10 h-10 text-[#11a277] animate-spin" />
           <p className="text-slate-500 font-medium animate-pulse">Curating your catalog...</p>
        </div>
      ) : sortedProperties.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white dark:border-white/5 shadow-sm p-16 text-center max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-[#11a277]/20 to-[#11a277]/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-[#11a277]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0a2845] dark:text-white mb-2">No listings found</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">We couldn't find anything matching your search. Try adjusting the filters or creating a new listing.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sortedProperties.map((property) => (
            <motion.div 
              key={property.id} 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group bg-white dark:bg-[#0a1120] rounded-3xl border border-white dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgb(17,162,119,0.08)] dark:hover:shadow-[0_20px_40px_rgb(17,162,119,0.15)] transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-[260px] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img 
                      src={property.images[0]} 
                      alt={property.society_name} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-80" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-white/95 text-[#0a2845] rounded-full shadow-lg backdrop-blur-md">
                    {property.listing_type}
                  </span>
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#11a277] to-[#15b283] text-white rounded-full shadow-lg">
                    {property.category}
                  </span>
                </div>

                {/* Price Overlay on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
                    {formatPrice(property.pricing)}
                  </h3>
                  <div className="flex items-center text-white/90 text-sm mt-1 font-medium drop-shadow">
                    <MapPin className="w-4 h-4 mr-1 text-white" />
                    <span className="truncate">{property.area_locality}, {property.city}</span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 flex flex-col flex-grow bg-white dark:bg-[#0a1120]">
                <h4 className="text-lg font-bold text-[#0a2845] dark:text-slate-100 mb-4 line-clamp-1 h-7">
                  {property.society_name || `${property.property_type} in ${property.area_locality}`}
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-2xl bg-[#11a277]/10 dark:bg-[#11a277]/20 flex items-center justify-center mr-3 shrink-0">
                      <Grid className="w-5 h-5 text-[#11a277]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Area</p>
                      <p className="font-bold text-[#0a2845] dark:text-white text-sm mt-0.5">{property.area_value_sqft} <span className="text-xs font-medium text-slate-500">sqft</span></p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-2xl bg-[#11a277]/10 dark:bg-[#11a277]/20 flex items-center justify-center mr-3 shrink-0">
                      <Building2 className="w-5 h-5 text-[#11a277]" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Type</p>
                      <p className="font-bold text-[#0a2845] dark:text-white text-sm mt-0.5 truncate" title={property.property_type}>{property.property_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
