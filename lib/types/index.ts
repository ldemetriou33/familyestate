// Database types (will be auto-generated from Supabase)
// For now, using manual types until we can run: npx supabase gen types typescript --project-id YOUR_PROJECT_REF

export type PropertyStatus = 'Active' | 'Maintenance' | 'Sold' | 'Development' | 'Archived'
export type UnitCategory = 'Room' | 'Suite' | 'Plot' | 'Apartment' | 'Villa'

export const PROPERTY_STATUS = ['Active', 'Maintenance', 'Sold', 'Development', 'Archived'] as const
export const UNIT_CATEGORY = ['Room', 'Suite', 'Plot', 'Apartment', 'Villa'] as const

// Mortgage details shape
export interface MortgageDetails {
  lender?: string
  rate?: string
  balance?: number
  monthly_payment?: number
  loan_type?: string
  term_years?: number
  start_date?: string
}

// Property type
export interface Property {
  id: string
  name: string
  slug: string
  type: string
  status: PropertyStatus
  description: string | null
  city: string | null
  country: string | null
  address: string | null
  location_lat: number | null
  location_long: number | null
  hero_image_url: string | null
  gallery_images: string[] | null
  amenities: string[] | null
  highlights: string[] | null
  mortgage_details: MortgageDetails | null
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

// Unit type
export interface Unit {
  id: string
  property_id: string
  name: string
  category: UnitCategory
  base_price: number
  surge_price: number | null
  is_event_mode_active: boolean
  amenities: string[]
  images: string[]
  capacity: number
  room_number: string | null
  floor: number | null
  description: string | null
  bed_type: string | null
  square_meters: number | null
  is_available: boolean
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Content Block type
export interface ContentBlock {
  id: string
  section_key: string
  content: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Action result type (for consistent error handling)
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// Property update type
export type PropertyUpdate = Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>

// Unit update type
export type UnitUpdate = Partial<Omit<Unit, 'id' | 'property_id' | 'created_at' | 'updated_at'>>

// Unit insert type
export type UnitInsert = Omit<Unit, 'id' | 'created_at' | 'updated_at'>

