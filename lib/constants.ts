// ============================================
// PRICING & LIMITS
// ============================================

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

// ============================================
// PROPERTY DATA (Mock/Fallback)
// ============================================

export const hotel = {
  name: 'The Grand Abbey Hotel',
  purchasePrice: 12500000,
  currentMortgageBalance: 8750000,
  currentInterestRate: 4.85,
  monthlyRentalIncome: 45000, // Estimated monthly hotel revenue
} as const

export const cafe = {
  name: 'Abbey Café',
  weeklyTarget: 15000, // £15,000 weekly target
} as const

export const rentalProperties = [
  {
    id: 'prop-res-001',
    name: 'Abbey Residences - Flat 1',
    location: 'London, SW1A 1AB',
    purchasePrice: 350000,
    currentMortgageBalance: 245000,
    currentInterestRate: 5.25,
    loanType: 'fixed' as const,
    monthlyRentalIncome: 1800,
  },
  {
    id: 'prop-res-002',
    name: 'Abbey Residences - Flat 2',
    location: 'London, SW1A 1AB',
    purchasePrice: 320000,
    currentMortgageBalance: 224000,
    currentInterestRate: 5.25,
    loanType: 'fixed' as const,
    monthlyRentalIncome: 1650,
  },
  {
    id: 'prop-res-003',
    name: 'Abbey Residences - Flat 3',
    location: 'London, SW1A 1AB',
    purchasePrice: 380000,
    currentMortgageBalance: 266000,
    currentInterestRate: 5.25,
    loanType: 'fixed' as const,
    monthlyRentalIncome: 1950,
  },
] as const
