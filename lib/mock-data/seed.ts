// Abbey OS Mock Data - Seed for Dashboard Visualization
// This provides immediate data for the Command Center

import { 
  Property, Unit, Booking, Lease, DailyLog, ActionItem, 
  Expense, Debt, Alert, CashPosition, Forecast,
  HotelMetrics, CafeMetrics, PortfolioMetrics
} from '../types/abbey-os'

// ============================================
// PROPERTIES
// ============================================

export const properties: Property[] = [
  {
    id: 'prop-hotel-001',
    name: 'The Grand Abbey Hotel',
    type: 'HOTEL',
    address: '15 Abbey Road',
    city: 'London',
    postcode: 'SW1A 1AA',
    description: 'Boutique hotel with 24 rooms in Central London',
    purchasePrice: 12500000,
    currentValue: 14200000,
    mortgageBalance: 8750000,
    interestRate: 4.85,
  },
  {
    id: 'prop-cafe-001',
    name: 'Abbey Café',
    type: 'CAFE',
    address: '17 Abbey Road',
    city: 'London',
    postcode: 'SW1A 1AA',
    description: 'Artisan café and bakery, 60 covers',
    purchasePrice: 450000,
    currentValue: 520000,
    mortgageBalance: 315000,
    interestRate: 5.50,
  },
  {
    id: 'prop-res-001',
    name: 'Abbey Residences',
    type: 'RESIDENTIAL',
    address: '19-25 Abbey Road',
    city: 'London',
    postcode: 'SW1A 1AB',
    description: '12 residential flats (mix of 1-3 beds)',
    purchasePrice: 3500000,
    currentValue: 4100000,
    mortgageBalance: 2450000,
    interestRate: 5.25,
  },
]

// ============================================
// UNITS (Hotel Rooms + Residential Flats)
// ============================================

export const units: Unit[] = [
  // Hotel Rooms
  { id: 'unit-h-101', propertyId: 'prop-hotel-001', unitNumber: '101', floor: 1, type: 'Standard', status: 'OCCUPIED', currentRate: 189, bedrooms: 1, bathrooms: 1 },
  { id: 'unit-h-102', propertyId: 'prop-hotel-001', unitNumber: '102', floor: 1, type: 'Standard', status: 'OCCUPIED', currentRate: 189, bedrooms: 1, bathrooms: 1 },
  { id: 'unit-h-103', propertyId: 'prop-hotel-001', unitNumber: '103', floor: 1, type: 'Deluxe', status: 'VACANT', currentRate: 249, bedrooms: 1, bathrooms: 1, features: ['City View'] },
  { id: 'unit-h-104', propertyId: 'prop-hotel-001', unitNumber: '104', floor: 1, type: 'Deluxe', status: 'MAINTENANCE', currentRate: 249, bedrooms: 1, bathrooms: 1 },
  { id: 'unit-h-201', propertyId: 'prop-hotel-001', unitNumber: '201', floor: 2, type: 'Superior', status: 'OCCUPIED', currentRate: 299, bedrooms: 1, bathrooms: 1, features: ['Balcony'] },
  { id: 'unit-h-202', propertyId: 'prop-hotel-001', unitNumber: '202', floor: 2, type: 'Superior', status: 'OCCUPIED', currentRate: 299, bedrooms: 1, bathrooms: 1 },
  { id: 'unit-h-203', propertyId: 'prop-hotel-001', unitNumber: '203', floor: 2, type: 'Suite', status: 'OCCUPIED', currentRate: 449, bedrooms: 2, bathrooms: 2 },
  { id: 'unit-h-204', propertyId: 'prop-hotel-001', unitNumber: '204', floor: 2, type: 'Suite', status: 'VACANT', currentRate: 449, bedrooms: 2, bathrooms: 2 },
  // ... More hotel rooms (24 total)
  
  // Residential Flats
  { id: 'unit-r-1', propertyId: 'prop-res-001', unitNumber: 'Flat 1', floor: 0, type: 'Studio', status: 'OCCUPIED', currentRate: 1450, bedrooms: 0, bathrooms: 1, squareMeters: 35 },
  { id: 'unit-r-2', propertyId: 'prop-res-001', unitNumber: 'Flat 2', floor: 0, type: '1-Bed', status: 'OCCUPIED', currentRate: 1850, bedrooms: 1, bathrooms: 1, squareMeters: 48 },
  { id: 'unit-r-3', propertyId: 'prop-res-001', unitNumber: 'Flat 3', floor: 1, type: '1-Bed', status: 'OCCUPIED', currentRate: 1900, bedrooms: 1, bathrooms: 1, squareMeters: 52 },
  { id: 'unit-r-4', propertyId: 'prop-res-001', unitNumber: 'Flat 4', floor: 1, type: '2-Bed', status: 'MAINTENANCE', currentRate: 2450, bedrooms: 2, bathrooms: 1, squareMeters: 68 },
  { id: 'unit-r-5', propertyId: 'prop-res-001', unitNumber: 'Flat 5', floor: 2, type: '2-Bed', status: 'OCCUPIED', currentRate: 2500, bedrooms: 2, bathrooms: 1, squareMeters: 72 },
  { id: 'unit-r-6', propertyId: 'prop-res-001', unitNumber: 'Flat 6', floor: 2, type: '2-Bed', status: 'OCCUPIED', currentRate: 2550, bedrooms: 2, bathrooms: 2, squareMeters: 75 },
  { id: 'unit-r-7', propertyId: 'prop-res-001', unitNumber: 'Flat 7', floor: 3, type: '3-Bed', status: 'OCCUPIED', currentRate: 3200, bedrooms: 3, bathrooms: 2, squareMeters: 95 },
  { id: 'unit-r-8', propertyId: 'prop-res-001', unitNumber: 'Flat 8', floor: 3, type: '3-Bed', status: 'VACANT', currentRate: 3350, bedrooms: 3, bathrooms: 2, squareMeters: 102 },
]

// ============================================
// BOOKINGS (Hotel)
// ============================================

const today = new Date()
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

export const bookings: Booking[] = [
  {
    id: 'book-001',
    unitId: 'unit-h-101',
    guestName: 'Mr. James Wilson',
    guestEmail: 'j.wilson@email.com',
    adults: 2,
    children: 0,
    checkIn: yesterday,
    checkOut: tomorrow,
    nights: 2,
    channel: 'BOOKING_COM',
    status: 'CHECKED_IN',
    roomRate: 189,
    totalPrice: 378,
    deposit: 189,
    balance: 189,
  },
  {
    id: 'book-002',
    unitId: 'unit-h-102',
    guestName: 'Ms. Sarah Chen',
    guestEmail: 's.chen@company.com',
    adults: 1,
    children: 0,
    checkIn: today,
    checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    nights: 3,
    channel: 'DIRECT',
    status: 'CHECKED_IN',
    roomRate: 189,
    totalPrice: 567,
    deposit: 567,
    balance: 0,
  },
  {
    id: 'book-003',
    unitId: 'unit-h-201',
    guestName: 'Dr. Michael Brown',
    adults: 2,
    children: 1,
    checkIn: yesterday,
    checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
    nights: 5,
    channel: 'EXPEDIA',
    status: 'CHECKED_IN',
    roomRate: 299,
    totalPrice: 1495,
    deposit: 500,
    balance: 995,
  },
]

// ============================================
// LEASES (Residential)
// ============================================

export const leases: Lease[] = [
  {
    id: 'lease-001',
    unitId: 'unit-r-1',
    tenantName: 'Emily Parker',
    tenantEmail: 'e.parker@email.com',
    tenantPhone: '07700 900001',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    rentAmount: 1450,
    deposit: 1450,
    paymentStatus: 'PAID',
    arrearsAmount: 0,
    lastPaymentDate: new Date('2024-12-01'),
    rightToRentCheck: true,
    gasCertExpiry: new Date('2025-06-15'),
    epcRating: 'C',
  },
  {
    id: 'lease-002',
    unitId: 'unit-r-2',
    tenantName: 'David Thompson',
    tenantEmail: 'd.thompson@email.com',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-01-14'),
    rentAmount: 1850,
    deposit: 1850,
    paymentStatus: 'OVERDUE',
    arrearsAmount: 3700, // 2 months arrears
    lastPaymentDate: new Date('2024-10-01'),
    rightToRentCheck: true,
    gasCertExpiry: new Date('2025-03-20'),
    epcRating: 'D',
  },
  {
    id: 'lease-003',
    unitId: 'unit-r-3',
    tenantName: 'Sophie Martinez',
    tenantEmail: 's.martinez@email.com',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    rentAmount: 1900,
    deposit: 1900,
    paymentStatus: 'PAID',
    arrearsAmount: 0,
    lastPaymentDate: new Date('2024-12-01'),
    rightToRentCheck: true,
    gasCertExpiry: new Date('2025-08-10'),
    epcRating: 'B',
  },
  {
    id: 'lease-004',
    unitId: 'unit-r-5',
    tenantName: 'Robert Johnson',
    tenantEmail: 'r.johnson@email.com',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-08-31'),
    rentAmount: 2500,
    deposit: 2500,
    paymentStatus: 'PARTIAL',
    arrearsAmount: 1250, // Half month
    lastPaymentDate: new Date('2024-11-15'),
    rightToRentCheck: true,
    gasCertExpiry: new Date('2025-01-05'), // EXPIRING SOON!
    epcRating: 'C',
  },
]

// ============================================
// ALERTS (Red Flags)
// ============================================

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    propertyId: 'prop-res-001',
    title: 'Water Leak Detected - Flat 4',
    message: 'Tenant reported water leak from bathroom ceiling. Plumber required urgently.',
    severity: 'CRITICAL',
    category: 'MAINTENANCE',
    isRead: false,
    isDismissed: false,
    source: 'SYSTEM',
    relatedType: 'UNIT',
    relatedId: 'unit-r-4',
    createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'alert-002',
    propertyId: 'prop-cafe-001',
    title: 'Cafe Margin Below 60%',
    message: 'Food cost running at 34% vs target 28%. Gross margin dropped to 58%.',
    severity: 'WARNING',
    category: 'FINANCIAL',
    isRead: false,
    isDismissed: false,
    source: 'SYSTEM',
    createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'alert-003',
    propertyId: 'prop-res-001',
    title: 'Rent Arrears: 2 Months Overdue',
    message: 'Flat 2 (David Thompson) - £3,700 arrears. Last payment Oct 2024.',
    severity: 'CRITICAL',
    category: 'FINANCIAL',
    isRead: false,
    isDismissed: false,
    source: 'SYSTEM',
    relatedType: 'LEASE',
    relatedId: 'lease-002',
    createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'alert-004',
    propertyId: 'prop-res-001',
    title: 'Gas Certificate Expiring',
    message: 'Flat 5 gas safety certificate expires on 05/01/2025. Book inspection now.',
    severity: 'WARNING',
    category: 'COMPLIANCE',
    isRead: false,
    isDismissed: false,
    source: 'SYSTEM',
    relatedType: 'LEASE',
    relatedId: 'lease-004',
    createdAt: new Date(today.getTime() - 48 * 60 * 60 * 1000),
  },
  {
    id: 'alert-005',
    propertyId: 'prop-hotel-001',
    title: 'Room 104 Out of Service',
    message: 'Deluxe room 104 marked for maintenance since Dec 28. Revenue loss: £249/night.',
    severity: 'WARNING',
    category: 'OPERATIONAL',
    isRead: true,
    isDismissed: false,
    source: 'SYSTEM',
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'alert-006',
    propertyId: 'prop-hotel-001',
    title: 'Low Occupancy Forecast',
    message: 'Next week occupancy forecast at 45%. Consider promotional rates.',
    severity: 'INFO',
    category: 'OCCUPANCY',
    isRead: false,
    isDismissed: false,
    source: 'SYSTEM',
    createdAt: new Date(),
  },
]

// ============================================
// ACTION ITEMS (Command Center Tasks)
// ============================================

export const actionItems: ActionItem[] = [
  {
    id: 'action-001',
    title: 'Call plumber for Flat 4 leak',
    description: 'Emergency repair needed. Water damage to ceiling below.',
    priority: 'HIGH',
    status: 'PENDING',
    estimatedImpactGbp: 2500,
    urgencyScore: 10,
    dueDate: today,
    category: 'Maintenance',
    relatedPropertyId: 'prop-res-001',
  },
  {
    id: 'action-002',
    title: 'Send arrears letter to Flat 2 tenant',
    description: 'Final notice before legal proceedings. £3,700 outstanding.',
    priority: 'HIGH',
    status: 'PENDING',
    estimatedImpactGbp: 3700,
    urgencyScore: 9,
    dueDate: today,
    category: 'Finance',
    relatedPropertyId: 'prop-res-001',
  },
  {
    id: 'action-003',
    title: 'Book gas safety inspection - Flat 5',
    description: 'Certificate expires 05/01/2025. Legal requirement.',
    priority: 'HIGH',
    status: 'PENDING',
    estimatedImpactGbp: 1000, // Potential fine
    urgencyScore: 8,
    dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    category: 'Compliance',
    relatedPropertyId: 'prop-res-001',
  },
  {
    id: 'action-004',
    title: 'Review cafe food supplier contracts',
    description: 'Food cost at 34%. Renegotiate or find alternatives.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    estimatedImpactGbp: 850, // Monthly savings
    urgencyScore: 7,
    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    category: 'Finance',
    relatedPropertyId: 'prop-cafe-001',
    assignedTo: 'John',
  },
  {
    id: 'action-005',
    title: 'Fix Room 104 AC unit',
    description: 'Room out of service since Dec 28. Lost revenue: £1,245.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    estimatedImpactGbp: 249, // Daily revenue
    urgencyScore: 6,
    dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    category: 'Maintenance',
    relatedPropertyId: 'prop-hotel-001',
  },
  {
    id: 'action-006',
    title: 'Launch January hotel promotion',
    description: '15% off stays of 3+ nights. Combat low occupancy forecast.',
    priority: 'MEDIUM',
    status: 'PENDING',
    estimatedImpactGbp: 5000,
    urgencyScore: 5,
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    category: 'Marketing',
    relatedPropertyId: 'prop-hotel-001',
  },
  {
    id: 'action-007',
    title: 'Advertise Flat 8 for let',
    description: '3-bed flat vacant. Target rent: £3,350/month.',
    priority: 'LOW',
    status: 'PENDING',
    estimatedImpactGbp: 3350,
    urgencyScore: 4,
    dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
    category: 'Lettings',
    relatedPropertyId: 'prop-res-001',
  },
]

// ============================================
// CASH POSITION
// ============================================

export const cashPosition: CashPosition = {
  id: 'cash-today',
  date: today,
  operatingBalance: 47850,
  reserveBalance: 125000,
  inflows: 3420,
  outflows: 1890,
  projected30Day: 52400,
  projected90Day: 68200,
}

// ============================================
// METRICS (Dashboard Summary)
// ============================================

export const hotelMetrics: HotelMetrics = {
  occupancyRate: 75,
  adr: 256,
  revpar: 192,
  arrivalsToday: 4,
  departuresToday: 2,
  revenueToday: 2048,
  revenueMTD: 45320,
}

export const cafeMetrics: CafeMetrics = {
  salesToday: 1840,
  salesMTD: 42500,
  coversToday: 86,
  laborPercentage: 28,
  foodCostPercentage: 34,
  grossMargin: 58,
}

export const portfolioMetrics: PortfolioMetrics = {
  totalUnits: 8,
  occupiedUnits: 6,
  vacantUnits: 1,
  maintenanceUnits: 1,
  totalRentRoll: 17700,
  totalArrears: 4950,
  complianceIssues: 1,
}

// ============================================
// 30-DAY FORECAST
// ============================================

export const forecast30Day: Forecast[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(today)
  date.setDate(today.getDate() + i)
  return {
    id: `forecast-${i}`,
    date,
    predictedRevenue: 4500 + Math.random() * 2000,
    predictedOccupancy: 0.6 + Math.random() * 0.3,
    predictedCovers: 70 + Math.floor(Math.random() * 40),
    confidenceLevel: 0.75 + Math.random() * 0.2,
  }
})

// ============================================
// DEBTS
// ============================================

export const debts: Debt[] = [
  {
    id: 'debt-001',
    propertyId: 'prop-hotel-001',
    lender: 'Barclays Commercial',
    loanType: 'Commercial Mortgage',
    principal: 10000000,
    currentBalance: 8750000,
    interestRate: 4.85,
    monthlyPayment: 52500,
    startDate: new Date('2020-06-01'),
    maturityDate: new Date('2045-06-01'),
    isFixed: true,
    fixedUntil: new Date('2025-06-01'),
  },
  {
    id: 'debt-002',
    propertyId: 'prop-res-001',
    lender: 'NatWest BTL',
    loanType: 'Buy-to-Let Portfolio',
    principal: 2800000,
    currentBalance: 2450000,
    interestRate: 5.25,
    monthlyPayment: 14720,
    startDate: new Date('2021-03-15'),
    maturityDate: new Date('2046-03-15'),
    isFixed: false,
  },
  {
    id: 'debt-003',
    propertyId: 'prop-cafe-001',
    lender: 'HSBC',
    loanType: 'Commercial Mortgage',
    principal: 350000,
    currentBalance: 315000,
    interestRate: 5.50,
    monthlyPayment: 2100,
    startDate: new Date('2022-09-01'),
    maturityDate: new Date('2047-09-01'),
    isFixed: true,
    fixedUntil: new Date('2027-09-01'),
  },
]

// ============================================
// EXPENSES (Upcoming)
// ============================================

export const expenses: Expense[] = [
  {
    id: 'exp-001',
    propertyId: 'prop-hotel-001',
    amount: 52500,
    category: 'PROFESSIONAL_FEES',
    vendor: 'Barclays Commercial',
    description: 'Monthly mortgage payment',
    status: 'PENDING',
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    isRecurring: true,
  },
  {
    id: 'exp-002',
    propertyId: 'prop-cafe-001',
    amount: 8500,
    category: 'PAYROLL',
    vendor: 'Staff Wages',
    description: 'Cafe weekly wages',
    status: 'PENDING',
    dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    isRecurring: true,
  },
  {
    id: 'exp-003',
    amount: 2450,
    category: 'INSURANCE',
    vendor: 'Aviva Commercial',
    description: 'Portfolio insurance - January',
    status: 'PAID',
    paidDate: today,
    isRecurring: true,
  },
  {
    id: 'exp-004',
    propertyId: 'prop-res-001',
    amount: 350,
    category: 'MAINTENANCE',
    vendor: 'Emergency Plumber',
    description: 'Flat 4 leak repair (estimate)',
    status: 'PENDING',
    isRecurring: false,
  },
]

