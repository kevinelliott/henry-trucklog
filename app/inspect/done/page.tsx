'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DoneContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') as 'safe' | 'fail' | null
  const defectCount = parseInt(searchParams.get('defects') || '0')

  const isSafe = status === 'safe'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSafe ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <span className="text-5xl">{isSafe ? '✅' : '❌'}</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Inspection Complete
        </h1>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg mb-4 ${
          isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isSafe ? '✅ SAFE TO DISPATCH' : '❌ DISPATCH LOCKED'}
        </div>

        <p className="text-slate-600 mb-6">
          {isSafe
            ? 'All inspection items passed. This vehicle is cleared for dispatch.'
            : `${defectCount} defect${defectCount !== 1 ? 's' : ''} found. This vehicle is locked for dispatch until defects are resolved.`
          }
        </p>

        {!isSafe && defectCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-red-800 mb-1">What happens next:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your fleet manager has been notified</li>
              <li>• Vehicle is locked from dispatch</li>
              <li>• Defects must be repaired before re-inspection</li>
            </ul>
          </div>
        )}

        {isSafe && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-green-800 mb-1">Vehicle cleared:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All 16 DOT inspection points passed</li>
              <li>• Inspection record saved</li>
              <li>• Vehicle status updated to Safe</li>
            </ul>
          </div>
        )}

        <p className="text-sm text-slate-400">
          You can close this page. Your inspection has been recorded.
        </p>
      </div>
    </div>
  )
}

export default function DonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DoneContent />
    </Suspense>
  )
}
