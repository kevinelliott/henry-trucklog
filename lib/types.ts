export type VehicleStatus = 'safe' | 'fail' | 'pending'
export type AssignmentStatus = 'pending' | 'completed' | 'expired'
export type InspectionStatus = 'safe' | 'fail'

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface Vehicle {
  id: string
  org_id: string
  unit_number: string
  make?: string
  model?: string
  year?: number
  vin?: string
  status: VehicleStatus
  last_inspection_at?: string
  created_at: string
}

export interface InspectionAssignment {
  id: string
  vehicle_id: string
  org_id: string
  token: string
  driver_name?: string
  assigned_by?: string
  status: AssignmentStatus
  due_at?: string
  created_at: string
  vehicle?: Vehicle
}

export interface InspectionItem {
  id: string
  label: string
  category: string
  result?: 'pass' | 'fail'
  defect_note?: string
}

export interface Inspection {
  id: string
  assignment_id?: string
  vehicle_id: string
  driver_name?: string
  driver_signature?: string
  odometer?: number
  overall_status: InspectionStatus
  defects: { item_id: string; label: string; note: string }[]
  items: InspectionItem[]
  notes?: string
  completed_at: string
  vehicle?: Vehicle
}
