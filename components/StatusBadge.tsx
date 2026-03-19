import { VehicleStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: VehicleStatus
  large?: boolean
}

export default function StatusBadge({ status, large = false }: StatusBadgeProps) {
  const config = {
    safe: {
      label: 'Safe',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      dot: 'bg-green-500',
    },
    fail: {
      label: 'Fail',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-500',
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dot: 'bg-yellow-500',
    },
  }

  const { label, icon, className, dot } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${className} ${
        large ? 'text-base px-4 py-1.5' : 'text-xs px-3 py-1'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {icon} {label}
    </span>
  )
}
