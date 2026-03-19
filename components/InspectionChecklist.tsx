'use client'

import { InspectionItem } from '@/lib/types'
import { CATEGORIES } from '@/lib/inspection-items'

interface InspectionChecklistProps {
  items: InspectionItem[]
  onChange: (items: InspectionItem[]) => void
}

export default function InspectionChecklist({ items, onChange }: InspectionChecklistProps) {
  function setResult(id: string, result: 'pass' | 'fail') {
    onChange(items.map(item => item.id === id ? { ...item, result, defect_note: result === 'pass' ? undefined : item.defect_note } : item))
  }

  function setDefectNote(id: string, note: string) {
    onChange(items.map(item => item.id === id ? { ...item, defect_note: note } : item))
  }

  return (
    <div className="space-y-8">
      {CATEGORIES.map(category => {
        const categoryItems = items.filter(item => item.category === category)
        if (categoryItems.length === 0) return null

        return (
          <div key={category}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
              {category}
            </h3>
            <div className="space-y-3">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border-2 p-4 transition-all ${
                    item.result === 'pass' ? 'border-green-200 bg-green-50' :
                    item.result === 'fail' ? 'border-red-200 bg-red-50' :
                    'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800 flex-1">{item.label}</p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setResult(item.id, 'pass')}
                        className={`min-w-[72px] py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                          item.result === 'pass'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        ✅ Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => setResult(item.id, 'fail')}
                        className={`min-w-[72px] py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                          item.result === 'fail'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50'
                        }`}
                      >
                        ❌ Fail
                      </button>
                    </div>
                  </div>

                  {item.result === 'fail' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-red-700 mb-1.5">
                        Describe defect *
                      </label>
                      <textarea
                        value={item.defect_note || ''}
                        onChange={(e) => setDefectNote(item.id, e.target.value)}
                        placeholder="Describe the issue in detail..."
                        rows={2}
                        className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
