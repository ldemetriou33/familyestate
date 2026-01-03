// Supabase Database Types
// Generated from Supabase schema

export type PropertyType = 'Hotel' | 'Land' | 'Villa' | 'Residential' | 'Commercial' | 'Mixed_Use'
export type PropertyStatus = 'Active' | 'Maintenance' | 'Sold' | 'Development' | 'Archived'
export type UnitCategory = 'Room' | 'Suite' | 'Plot' | 'Apartment' | 'Villa'
export type CafeCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Alcohol' | 'Event_Special' | 'Dessert' | 'Beverage'

export interface Property {
  id: string
  name: string
  type: PropertyType
  slug: string
  location_lat: number | null
  location_long: number | null
  status: PropertyStatus
  description: string | null
  hero_image_url: string | null
  gallery_images: string[]
  amenities: string[]
  highlights: string[]
  address: string | null
  city: string | null
  postcode: string | null
  country: string
  meta_title: string | null
  meta_description: string | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

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

export interface ContentBlock {
  id: string
  section_key: string
  content: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Amenity {
  id: string
  name: string
  icon: string | null
  category: string | null
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface CafeMenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: CafeCategory
  is_available: boolean
  image_url: string | null
  allergens: string[]
  dietary_info: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

