'use client'

import { Vehicle } from '@/lib/types'
import StatusBadge from './StatusBadge'

interface VehicleCardProps {
  vehicle: Vehicle
  onAssignInspection: (vehicle: Vehicle) => void
}

export default function VehicleCard({ vehicle, onAssignInspection }: VehicleCardProps) {
  const isBlocked = vehicle.status === 'fail' || vehicle.status === 'pending'

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${
      vehicle.status === 'fail' ? 'border-red-200' :
      vehicle.status === 'pending' ? 'border-yellow-200' :
      'border-green-200'
    }`}>
      {/* Dispatch lock banner */}
      {isBlocked && (
        <div className={`px-4 py-2 text-xs font-bold text-center tracking-wide ${
          vehicle.status === 'fail' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-yellow-900'
        }`}>
          {vehicle.status === 'fail' ? '🚫 DISPATCH LOCKED — DEFECTS FOUND' : '⚠️ DISPATCH LOCKED — INSPECTION REQUIRED'}
        </div>
      )}
      {vehicle.status === 'safe' && (
        <div className="px-4 py-2 text-xs font-bold text-center tracking-wide bg-green-600 text-white">
          ✅ CLEARED FOR DISPATCH
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Unit #{vehicle.unit_number}</h3>
            <p className="text-slate-500 text-sm">
              {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
            </p>
            {vehicle.vin && (
              <p className="text-slate-400 text-xs mt-0.5">VIN: {vehicle.vin}</p>
            )}
          </div>
          <StatusBadge status={vehicle.status} />
        </div>

        {vehicle.last_inspection_at && (
          <p className="text-xs text-slate-400 mb-4">
            Last inspected: {new Date(vehicle.last_inspection_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        )}

        <button
          onClick={() => onAssignInspection(vehicle)}
          className="w-full bg-slate-900 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Assign Inspection
        </button>
      </div>
    </div>
  )
}
