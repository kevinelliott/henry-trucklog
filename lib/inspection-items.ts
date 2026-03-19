import { InspectionItem } from './types'

export const INSPECTION_ITEMS: Omit<InspectionItem, 'result' | 'defect_note'>[] = [
  { id: 'lights', label: 'Lights & Reflectors', category: 'Exterior' },
  { id: 'tires', label: 'Tires & Wheels', category: 'Exterior' },
  { id: 'brakes', label: 'Brake System', category: 'Safety' },
  { id: 'steering', label: 'Steering Mechanism', category: 'Safety' },
  { id: 'horn', label: 'Horn', category: 'Safety' },
  { id: 'wipers', label: 'Windshield Wipers', category: 'Safety' },
  { id: 'mirrors', label: 'Mirrors', category: 'Exterior' },
  { id: 'coupling', label: 'Coupling Devices', category: 'Exterior' },
  { id: 'emergency', label: 'Emergency Equipment', category: 'Safety' },
  { id: 'fluids', label: 'Fluid Levels (oil, coolant, washer)', category: 'Engine' },
  { id: 'battery', label: 'Battery', category: 'Engine' },
  { id: 'belts', label: 'Belts & Hoses', category: 'Engine' },
  { id: 'exhaust', label: 'Exhaust System', category: 'Engine' },
  { id: 'fuel', label: 'Fuel System', category: 'Engine' },
  { id: 'cargo', label: 'Cargo Security', category: 'Load' },
  { id: 'documents', label: 'Required Documents (registration, insurance)', category: 'Administrative' },
]

export const CATEGORIES = ['Exterior', 'Safety', 'Engine', 'Load', 'Administrative'] as const
