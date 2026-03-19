'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { InspectionAssignment, Vehicle, InspectionItem } from '@/lib/types'
import { INSPECTION_ITEMS } from '@/lib/inspection-items'
import InspectionChecklist from '@/components/InspectionChecklist'

export default function InspectPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [assignment, setAssignment] = useState<InspectionAssignment | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const [driverName, setDriverName] = useState('')
  const [odometer, setOdometer] = useState('')
  const [signature, setSignature] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InspectionItem[]>(
    INSPECTION_ITEMS.map(item => ({ ...item }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAssignment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token])

  async function loadAssignment() {
    const { data: assignmentData } = await supabase
      .from('inspection_assignments')
      .select('*')
      .eq('token', params.token)
      .single()

    if (!assignmentData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (assignmentData.status === 'completed') {
      setAlreadyDone(true)
      setLoading(false)
      return
    }

    setAssignment(assignmentData)
    if (assignmentData.driver_name) {
      setDriverName(assignmentData.driver_name)
    }

    const { data: vehicleData } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', assignmentData.vehicle_id)
      .single()

    setVehicle(vehicleData)
    setLoading(false)
  }

  const allItemsAnswered = items.every(item => item.result !== undefined)
  const failedItems = items.filter(item => item.result === 'fail')
  const hasDefectNotes = failedItems.every(item => item.defect_note && item.defect_note.trim())
  const canSubmit = allItemsAnswered && hasDefectNotes && driverName.trim() && signature.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !assignment || !vehicle) return

    setSubmitting(true)
    setError('')

    const overallStatus = failedItems.length > 0 ? 'fail' : 'safe'
    const defects = failedItems.map(item => ({
      item_id: item.id,
      label: item.label,
      note: item.defect_note || '',
    }))

    // Insert inspection
    const { error: inspError } = await supabase.from('inspections').insert({
      assignment_id: assignment.id,
      vehicle_id: vehicle.id,
      driver_name: driverName,
      driver_signature: signature,
      odometer: odometer ? parseInt(odometer) : null,
      overall_status: overallStatus,
      defects,
      items: items.map(({ id, label, category, result, defect_note }) => ({
        id, label, category, result, defect_note
      })),
      notes: notes || null,
    })

    if (inspError) {
      setError(inspError.message)
      setSubmitting(false)
      return
    }

    // Update assignment status
    await supabase
      .from('inspection_assignments')
      .update({ status: 'completed' })
      .eq('id', assignment.id)

    // Update vehicle status
    await supabase
      .from('vehicles')
      .update({
        status: overallStatus,
        last_inspection_at: new Date().toISOString(),
      })
      .eq('id', vehicle.id)

    router.push(`/inspect/done?status=${overallStatus}&defects=${defects.length}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading inspection...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link Not Found</h1>
          <p className="text-slate-500">This inspection link is invalid or has expired. Contact your fleet manager for a new link.</p>
        </div>
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Already Completed</h1>
          <p className="text-slate-500">This inspection has already been submitted. Contact your fleet manager if you need to re-inspect.</p>
        </div>
      </div>
    )
  }

  const answeredCount = items.filter(i => i.result).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-5 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-base">DOT Pre-Trip Inspection</h1>
              {vehicle && (
                <p className="text-slate-400 text-sm truncate">
                  Unit #{vehicle.unit_number}
                  {vehicle.make ? ` — ${[vehicle.make, vehicle.model].filter(Boolean).join(' ')}` : ''}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-blue-400">{answeredCount}/{items.length}</div>
              <div className="text-xs text-slate-400">completed</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Driver info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Driver Information</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Driver Name *</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Odometer Reading</label>
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Miles"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 text-lg">Inspection Checklist</h2>
          <InspectionChecklist items={items} onChange={setItems} />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations or comments..."
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        {/* Signature */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-1">Digital Signature</h2>
          <p className="text-sm text-slate-500 mb-3">
            By signing, I certify this inspection was performed and the information is accurate and complete.
          </p>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            required
            placeholder="Type your full name as signature"
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base italic"
          />
          {signature && (
            <p className="text-xs text-slate-400 mt-2">
              ✓ Signed: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Status summary */}
        {allItemsAnswered && (
          <div className={`rounded-xl border-2 p-5 ${
            failedItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <h3 className={`font-bold text-lg mb-1 ${failedItems.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
              {failedItems.length > 0 ? '❌ Defects Found' : '✅ Vehicle Ready'}
            </h3>
            <p className={`text-sm ${failedItems.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {failedItems.length > 0
                ? `${failedItems.length} item${failedItems.length !== 1 ? 's' : ''} failed. Vehicle will be marked as FAILED and dispatch locked.`
                : 'All items passed. Vehicle will be marked as SAFE and cleared for dispatch.'}
            </p>
            {failedItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {failedItems.map(item => (
                  <li key={item.id} className="text-sm text-red-700">• {item.label}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <div className="max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl text-base font-bold transition-colors"
            >
              {submitting ? 'Submitting...' :
               !allItemsAnswered ? `Complete All Items (${answeredCount}/${items.length})` :
               !driverName.trim() ? 'Enter Driver Name' :
               !signature.trim() ? 'Sign to Submit' :
               'Submit Inspection'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
