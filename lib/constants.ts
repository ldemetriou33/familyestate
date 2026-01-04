export const PRICING = {
  DEFAULT_SURGE_MULTIPLIER: 1.5,
  MIN_SURGE_MULTIPLIER: 1.0,
  MAX_SURGE_MULTIPLIER: 3.0,
} as const

export const LIMITS = {
  MAX_IMAGES_PER_PROPERTY: 20,
  MAX_IMAGES_PER_UNIT: 10,
  MAX_AMENITIES: 50,
  MAX_SLUG_LENGTH: 100,
} as const

export const REVALIDATION_PATHS = {
  property: ['/admin', '/admin/properties', '/admin/properties/[id]', '/'] as const,
  unit: ['/admin', '/admin/rooms', '/admin/rooms/[id]', '/'] as const,
  content: ['/admin', '/admin/content', '/'] as const,
} as const
