'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UploadCloud, X, MapPin, Building, Tag, Images, IndianRupee, ArrowLeft, ImagePlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddPropertyFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddPropertyForm({ onSuccess, onCancel }: AddPropertyFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  const [formData, setFormData] = useState({
    category: 'Residential',
    listing_type: 'Rent',
    city: '',
    area_locality: '',
    subarea: '',
    society_name: '',
    property_type: 'Apartment',
    area_type: 'Carpet',
    area_value_sqft: '',
    floor_number: '',
    pricing: '',
    available_from: '',
    parking: 'Not Available',
    furnishing_status: 'Unfurnished'
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages(prev => [...prev, ...filesArray])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      setImages(prev => [...prev, ...filesArray])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImagesToBucket = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of images) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `builder_properties/${fileName}`

      const { error: uploadError } = await supabase.storage.from('builder_images').upload(filePath, file)
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from('builder_images').getPublicUrl(filePath)
      urls.push(publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let imageUrls: string[] = []
      if (images.length > 0) imageUrls = await uploadImagesToBucket()

      const { error } = await supabase
        .from('builder_properties')
        .insert({
          category: formData.category,
          listing_type: formData.listing_type,
          city: formData.city,
          area_locality: formData.area_locality,
          subarea: formData.subarea,
          society_name: formData.society_name,
          property_type: formData.property_type,
          area_type: formData.area_type,
          area_value_sqft: parseFloat(formData.area_value_sqft) || 0,
          floor_number: parseInt(formData.floor_number, 10) || 0,
          pricing: parseFloat(formData.pricing) || 0,
          available_from: formData.available_from,
          parking: formData.parking,
          furnishing_status: formData.furnishing_status,
          images: imageUrls
        })

      if (error) throw error
      toast.success('Property beautifully listed!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      let newState = { ...prev, [name]: value }
      
      // Handle conditional reset when switching from Commercial to Residential
      if (name === 'category' && value === 'Residential') {
        if (newState.listing_type === 'Plot') newState.listing_type = 'Rent'
        if (newState.property_type === 'Plot') newState.property_type = 'Apartment'
      }

      return newState
    })
  }

  const inputClass = "w-full h-12 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 px-4 text-sm font-medium text-[#0a2845] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#11a277]/10 dark:focus:ring-[#11a277]/20 focus:border-[#11a277]/30 dark:focus:border-[#11a277]/50 transition-all shadow-sm"
  const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block ml-1"
  const sectionClass = "bg-white dark:bg-[#0a1120] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors"

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto pb-10 relative">
      
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mb-8 bg-[#f3f7f6]/95 dark:bg-[#020813]/95 backdrop-blur-md flex items-center justify-between border-b sm:border-transparent border-slate-200 dark:border-white/5 transition-colors">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0a2845] dark:text-slate-400 dark:hover:text-white transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>

        <button 
          type="submit" 
          disabled={loading} 
          className="h-11 px-6 bg-gradient-to-r from-[#11a277] to-[#15b283] hover:from-[#0e8a65] hover:to-[#11a277] text-white font-bold rounded-[10px] shadow-[0_8px_20px_rgb(17,162,119,0.25)] transition-all transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-70 disabled:filter-grayscale flex items-center gap-2 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Section 1: Core Tagging */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={sectionClass}>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="p-2 bg-[#11a277]/10 dark:bg-[#11a277]/20 rounded-lg text-[#11a277]"><Tag className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-[#0a2845] dark:text-white">Classification</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Listing Type</label>
              <select name="listing_type" value={formData.listing_type} onChange={handleChange} className={inputClass}>
                <option value="Rent">For Rent</option>
                <option value="Resale">For Resale</option>
                {formData.category === 'Commercial' && (
                  <option value="Plot">Plot / Land</option>
                )}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="p-2 bg-[#11a277]/10 dark:bg-[#11a277]/20 rounded-lg text-[#11a277]"><MapPin className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-[#0a2845] dark:text-white">Location Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className={labelClass}>City *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className={inputClass} />
            </div>
            <div className="col-span-1">
              <label className={labelClass}>Area / Locality *</label>
              <input type="text" name="area_locality" required value={formData.area_locality} onChange={handleChange} placeholder="e.g. Andheri West" className={inputClass} />
            </div>
            <div className="col-span-1">
              <label className={labelClass}>Subarea <span className="normal-case font-medium text-slate-400 dark:text-slate-500 text-[10px] ml-1">(Optional)</span></label>
              <input type="text" name="subarea" value={formData.subarea} onChange={handleChange} placeholder="e.g. Lokhandwala" className={inputClass} />
            </div>
            <div className="col-span-1">
              <label className={labelClass}>Society Name</label>
              <input type="text" name="society_name" value={formData.society_name} onChange={handleChange} placeholder="e.g. Green Valley" className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* Section 3: Property Specs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={sectionClass}>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="p-2 bg-[#11a277]/10 dark:bg-[#11a277]/20 rounded-lg text-[#11a277]"><Building className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-[#0a2845] dark:text-white">Property Specs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Property Type</label>
              <select name="property_type" value={formData.property_type} onChange={handleChange} className={inputClass}>
                <option value="Apartment">Apartment</option>
                <option value="Independent House / Villa">Independent House / Villa</option>
                <option value="Independent Floor">Independent Floor</option>
                <option value="Studio">Studio</option>
                {formData.category === 'Commercial' && (
                  <option value="Plot">Plot</option>
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Area Type</label>
              <select name="area_type" value={formData.area_type} onChange={handleChange} className={inputClass}>
                <option value="Carpet">Carpet</option>
                <option value="Buildup">Buildup</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Area (sq.ft) *</label>
              <input type="number" name="area_value_sqft" required value={formData.area_value_sqft} onChange={handleChange} placeholder="1200" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Floor Number</label>
              <input type="number" name="floor_number" min="0" max="150" value={formData.floor_number} onChange={handleChange} placeholder="5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Furnishing</label>
              <select name="furnishing_status" value={formData.furnishing_status} onChange={handleChange} className={inputClass}>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Parking</label>
              <select name="parking" value={formData.parking} onChange={handleChange} className={inputClass}>
                <option value="Not Available">Not Available</option>
                <option value="Open">Open</option>
                <option value="Covered">Covered</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Pricing & Dates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={sectionClass}>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="p-2 bg-[#11a277]/10 dark:bg-[#11a277]/20 rounded-lg text-[#11a277]"><IndianRupee className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-[#0a2845] dark:text-white">Valuation & Availability</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Expected Price *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">₹</span>
                </div>
                <input type="number" name="pricing" required value={formData.pricing} onChange={handleChange} placeholder="15000000" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Available From *</label>
              <input type="date" name="available_from" required value={formData.available_from} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* Section 5: Media (Reimagined UX) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={sectionClass}>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="p-2 bg-[#11a277]/10 dark:bg-[#11a277]/20 rounded-lg text-[#11a277]"><Images className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-[#0a2845] dark:text-white">Interactive Visuals</h3>
          </div>
          
          <div className="space-y-6">
            {/* Massive Dropzone */}
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#11a277] bg-[#11a277]/10' 
                  : 'border-slate-300 dark:border-white/10 bg-slate-50 hover:bg-[#11a277]/5 dark:bg-black/20 dark:hover:bg-[#11a277]/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 transition-transform ${isDragging ? 'scale-110 bg-[#11a277] text-white' : 'bg-white dark:bg-slate-800 text-[#11a277]'}`}>
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[#0a2845] dark:text-white mb-1">
                {isDragging ? 'Drop images here!' : 'Click or drag images to upload'}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Supports JPG, PNG, WEBP (Max 5MB per file)
              </span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {/* Uploaded Gallery Grid */}
            {images.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" /> Media Selected ({images.length})
                </p>
                <div className="flex flex-wrap gap-4">
                  <AnimatePresence>
                    {images.map((file, idx) => (
                      <motion.div 
                        key={file.name + idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        layout
                        className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm group"
                      >
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); removeImage(idx); }} 
                            className="bg-white/90 text-red-500 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors transform scale-75 group-hover:scale-100 shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </form>
  )
}
