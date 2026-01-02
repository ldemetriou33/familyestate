// TypeScript interfaces for property data
export interface RentalProperty {
  id: string
  name: string
  location: string
  purchasePrice: number
  currentMortgageBalance: number
  currentInterestRate: number // as percentage (e.g., 5.5 for 5.5%)
  monthlyRentalIncome: number
}

export interface Hotel {
  id: string
  name: string
  location: string
  purchasePrice: number
  currentMortgageBalance: number
  currentInterestRate: number
  monthlyRentalIncome: number // Hotel revenue
}

export interface Cafe {
  id: string
  name: string
  location: string
  purchasePrice: number
  currentMortgageBalance: number
  currentInterestRate: number
  monthlyRentalIncome: number // Cafe revenue
  weeklyTarget: number // £15,000 baseline
}

// 12 UK Rental Properties
export const rentalProperties: RentalProperty[] = [
  {
    id: 'rental-001',
    name: 'London Flat - Kensington',
    location: 'London, SW7',
    purchasePrice: 850000,
    currentMortgageBalance: 595000,
    currentInterestRate: 5.25,
    monthlyRentalIncome: 3200,
  },
  {
    id: 'rental-002',
    name: 'London Flat - Islington',
    location: 'London, N1',
    purchasePrice: 625000,
    currentMortgageBalance: 437500,
    currentInterestRate: 5.45,
    monthlyRentalIncome: 2450,
  },
  {
    id: 'rental-003',
    name: 'Manchester House',
    location: 'Manchester, M1',
    purchasePrice: 285000,
    currentMortgageBalance: 199500,
    currentInterestRate: 5.15,
    monthlyRentalIncome: 1250,
  },
  {
    id: 'rental-004',
    name: 'Birmingham Apartment',
    location: 'Birmingham, B1',
    purchasePrice: 195000,
    currentMortgageBalance: 136500,
    currentInterestRate: 5.35,
    monthlyRentalIncome: 850,
  },
  {
    id: 'rental-005',
    name: 'Leeds Terraced House',
    location: 'Leeds, LS1',
    purchasePrice: 165000,
    currentMortgageBalance: 115500,
    currentInterestRate: 5.20,
    monthlyRentalIncome: 750,
  },
  {
    id: 'rental-006',
    name: 'Bristol Flat',
    location: 'Bristol, BS1',
    purchasePrice: 275000,
    currentMortgageBalance: 192500,
    currentInterestRate: 5.30,
    monthlyRentalIncome: 1100,
  },
  {
    id: 'rental-007',
    name: 'Edinburgh Apartment',
    location: 'Edinburgh, EH1',
    purchasePrice: 320000,
    currentMortgageBalance: 224000,
    currentInterestRate: 5.10,
    monthlyRentalIncome: 1350,
  },
  {
    id: 'rental-008',
    name: 'Glasgow House',
    location: 'Glasgow, G1',
    purchasePrice: 185000,
    currentMortgageBalance: 129500,
    currentInterestRate: 5.40,
    monthlyRentalIncome: 800,
  },
  {
    id: 'rental-009',
    name: 'Liverpool Terraced',
    location: 'Liverpool, L1',
    purchasePrice: 145000,
    currentMortgageBalance: 101500,
    currentInterestRate: 5.25,
    monthlyRentalIncome: 650,
  },
  {
    id: 'rental-010',
    name: 'Newcastle Flat',
    location: 'Newcastle, NE1',
    purchasePrice: 125000,
    currentMortgageBalance: 87500,
    currentInterestRate: 5.15,
    monthlyRentalIncome: 550,
  },
  {
    id: 'rental-011',
    name: 'Sheffield House',
    location: 'Sheffield, S1',
    purchasePrice: 155000,
    currentMortgageBalance: 108500,
    currentInterestRate: 5.30,
    monthlyRentalIncome: 700,
  },
  {
    id: 'rental-012',
    name: 'Nottingham Apartment',
    location: 'Nottingham, NG1',
    purchasePrice: 175000,
    currentMortgageBalance: 122500,
    currentInterestRate: 5.20,
    monthlyRentalIncome: 750,
  },
]

// Hotel Property
export const hotel: Hotel = {
  id: 'hotel-001',
  name: 'The Grand Abbey Hotel',
  location: 'London, SW1',
  purchasePrice: 12500000,
  currentMortgageBalance: 8750000,
  currentInterestRate: 4.85,
  monthlyRentalIncome: 485000, // Hotel revenue
}

// Cafe Property
export const cafe: Cafe = {
  id: 'cafe-001',
  name: 'Abbey Café',
  location: 'London, SW7',
  purchasePrice: 450000,
  currentMortgageBalance: 315000,
  currentInterestRate: 5.50,
  monthlyRentalIncome: 65000, // Cafe revenue
  weeklyTarget: 15000, // £15,000/week baseline
}

