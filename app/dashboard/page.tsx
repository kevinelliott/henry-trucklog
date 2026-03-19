'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Vehicle, Organization, Inspection } from '@/lib/types'
import VehicleCard from '@/components/VehicleCard'
import AddVehicleModal from '@/components/AddVehicleModal'
import AssignInspectionModal from '@/components/AssignInspectionModal'
import StatusBadge from '@/components/StatusBadge'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser({ email: user.email, id: user.id })

    // Load or create organization
    let { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      .single()

    if (!orgData) {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({ name: user.email?.split('@')[0] + "'s Fleet" })
        .select()
        .single()
      orgData = newOrg
    }

    if (orgData) {
      setOrg(orgData)

      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('org_id', orgData.id)
        .order('created_at', { ascending: false })

      setVehicles(vehiclesData || [])

      // Load recent inspections
      if (vehiclesData && vehiclesData.length > 0) {
        const vehicleIds = (vehiclesData as Vehicle[]).map((v) => v.id)
        const { data: inspData } = await supabase
          .from('inspections')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .order('completed_at', { ascending: false })
          .limit(20)

        setInspections(inspData || [])
      }
    }

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const safeCount = vehicles.filter(v => v.status === 'safe').length
  const failCount = vehicles.filter(v => v.status === 'fail').length
  const pendingCount = vehicles.filter(v => v.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading fleet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg">TruckLog</span>
          </div>
        </div>

        <nav className="p-4 flex-1">
          <div className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Fleet Overview
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
            <p className="text-sm text-white truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left text-sm text-slate-400 hover:text-white transition-colors py-1"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{org?.name || 'Fleet Dashboard'}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Pre-trip inspection & compliance management</p>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">Safe</span>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{safeCount}</div>
              <p className="text-xs text-slate-400 mt-1">cleared for dispatch</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">Failed</span>
                <span className="text-2xl">❌</span>
              </div>
              <div className="text-3xl font-bold text-red-600">{failCount}</div>
              <p className="text-xs text-slate-400 mt-1">dispatch locked</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">Pending</span>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-slate-400 mt-1">awaiting inspection</p>
            </div>
          </div>

          {/* Dispatch alert */}
          {(failCount > 0 || pendingCount > 0) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl shrink-0">🚫</span>
              <div>
                <p className="font-bold text-red-800">Dispatch Warning</p>
                <p className="text-red-700 text-sm mt-0.5">
                  {failCount > 0 && `${failCount} vehicle${failCount !== 1 ? 's' : ''} failed inspection. `}
                  {pendingCount > 0 && `${pendingCount} vehicle${pendingCount !== 1 ? 's' : ''} awaiting inspection. `}
                  Do not dispatch locked vehicles.
                </p>
              </div>
            </div>
          )}

          {/* Fleet */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Fleet ({vehicles.length})</h2>
            {vehicles.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="text-5xl mb-4">🚛</div>
                <h3 className="font-semibold text-slate-700 mb-2">No vehicles yet</h3>
                <p className="text-slate-400 text-sm mb-4">Add your first vehicle to get started with fleet inspections.</p>
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Add First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onAssignInspection={(v) => setSelectedVehicle(v)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent inspections */}
          {inspections.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Inspections</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Driver</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Vehicle</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Defects</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspections.map(inspection => {
                      const vehicle = vehicles.find(v => v.id === inspection.vehicle_id)
                      return (
                        <tr key={inspection.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 text-sm font-medium text-slate-900">
                            {inspection.driver_name || 'Unknown'}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">
                            {vehicle ? `Unit #${vehicle.unit_number}` : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={inspection.overall_status} />
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">
                            {Array.isArray(inspection.defects) && inspection.defects.length > 0
                              ? `${inspection.defects.length} defect${inspection.defects.length !== 1 ? 's' : ''}`
                              : 'None'}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500">
                            {new Date(inspection.completed_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddVehicle && org && (
        <AddVehicleModal
          orgId={org.id}
          onClose={() => setShowAddVehicle(false)}
          onAdded={loadData}
        />
      )}
      {selectedVehicle && org && user && (
        <AssignInspectionModal
          vehicle={selectedVehicle}
          orgId={org.id}
          assignedBy={user.email || user.id}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  )
}
