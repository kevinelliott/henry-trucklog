'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Vehicle } from '@/lib/types'

interface AssignInspectionModalProps {
  vehicle: Vehicle
  orgId: string
  assignedBy: string
  onClose: () => void
}

export default function AssignInspectionModal({ vehicle, orgId, assignedBy, onClose }: AssignInspectionModalProps) {
  const [driverName, setDriverName] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('inspection_assignments')
      .insert({
        vehicle_id: vehicle.id,
        org_id: orgId,
        driver_name: driverName || null,
        assigned_by: assignedBy,
        due_at: dueAt || null,
        status: 'pending',
      })
      .select('token')
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const link = `${window.location.origin}/inspect/${data.token}`
    setGeneratedLink(link)
    setLoading(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assign Inspection</h2>
              <p className="text-sm text-slate-500 mt-0.5">Unit #{vehicle.unit_number} — {[vehicle.make, vehicle.model].filter(Boolean).join(' ')}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleAssign} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Driver Name (optional)</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="John Smith"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due By (optional)</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-green-800">Inspection Link Created!</p>
              <p className="text-green-600 text-sm mt-1">Share this link with the driver</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1.5 font-medium">Inspection URL:</p>
              <p className="text-sm text-slate-700 break-all font-mono">{generatedLink}</p>
            </div>

            <button
              onClick={copyLink}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-700 text-white'
              }`}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>

            <button
              onClick={onClose}
              className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
