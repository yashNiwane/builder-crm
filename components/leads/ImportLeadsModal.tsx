'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'

export default function ImportLeadsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setError('')
    setSuccess('')

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV. Please check the format.')
          return
        }
        
        // Basic validation - ensure Name and Phone exist
        const rows = results.data as any[]
        if (rows.length === 0) {
          setError('The CSV file is empty.')
          return
        }
        
        const firstRow = rows[0]
        if (!firstRow['Name'] || !firstRow['Phone']) {
          setError('CSV must contain "Name" and "Phone" columns exactly as written.')
          return
        }
        
        setPreview(rows.slice(0, 5)) // show top 5
      }
    })
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        let imported = 0
        let skipped = 0

        // Parse and clean data
        const leadRecords = rows.map(r => ({
          name: r['Name']?.trim(),
          phone: r['Phone']?.trim()?.substring(0, 20),
          email: r['Email']?.trim() || null,
          interest: r['Interest']?.trim() || null,
          budget_min: r['Budget Min'] ? parseInt(r['Budget Min']) : null,
          budget_max: r['Budget Max'] ? parseInt(r['Budget Max']) : null,
          source: r['Source']?.trim() || null,
          notes: r['Notes']?.trim() || null,
          status: 'new',
          assigned_agent: user.id,
          created_by: user.id
        })).filter(r => r.name && r.phone) // must have name and phone

        if (leadRecords.length === 0) {
          setError('No valid leads found in the CSV.')
          setLoading(false)
          return
        }

        // Fast bulk insert using "on conflict do nothing" approach isn't natively supported 
        // with Supabase js without custom RPC, so we will insert in chunks and handle errors 
        // or check phones first to prevent duplicate errors killing the batch.

        // Get all existing phones
        const phones = leadRecords.map(r => r.phone)
        const { data: existing } = await supabase
          .from('leads')
          .select('phone')
          .in('phone', phones)
        
        const existingPhones = new Set(existing?.map(e => e.phone) || [])
        
        const newRecords = leadRecords.filter(r => !existingPhones.has(r.phone))
        skipped = leadRecords.length - newRecords.length

        if (newRecords.length > 0) {
           const { error: insertError } = await supabase
             .from('leads')
             .insert(newRecords)

           if (insertError) {
             setError(insertError.message)
             setLoading(false)
             return
           }
           imported = newRecords.length
        }

        setSuccess(`Successfully imported ${imported} leads. ${skipped > 0 ? `Skipped ${skipped} duplicates.` : ''}`)
        setFile(null)
        setPreview([])
        router.refresh()
        setLoading(false)
        
        // Auto close after success
        setTimeout(() => {
          onClose()
          setSuccess('')
        }, 3000)
      }
    })
  }

  const downloadTemplate = () => {
    const headers = "Name,Phone,Email,Interest,Budget Min,Budget Max,Source,Notes\n"
    const sample = "John Doe,9876543210,john@example.com,3BHK,5000000,7500000,Facebook,Looking for ready possession\n"
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "builder_crm_lead_template.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: 16
    }}>
      <div className="card animate-in" style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Bulk Import Leads</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
          Upload a CSV file exported from Excel or Google Sheets. 
          Make sure your columns match the required format.
        </p>

        <button onClick={downloadTemplate} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
          ↓ Download CSV Template
        </button>

        <div className="input-group">
          <label>Select CSV File</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="input" 
            style={{ padding: '8px' }}
          />
        </div>

        {error && <div className="login-error" style={{ marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: 'var(--accent-green)', backgroundColor: 'rgba(46,213,115,0.1)', padding: 12, borderRadius: 8, marginTop: 12, fontSize: '0.875rem' }}>{success}</div>}

        {preview.length > 0 && !success && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 8, fontSize: '0.875rem' }}>Preview (First {preview.length} rows)</h4>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Name</th>
                    <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Phone</th>
                    <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>{row['Name'] || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>{row['Phone'] || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>{row['Interest'] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={handleImport} 
              className="btn btn-primary btn-block" 
              style={{ marginTop: 24 }}
              disabled={loading}
            >
              {loading ? 'Importing...' : `Confirm & Import Leads`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
