// Abbey OS Type Definitions
// Matching Prisma schema for frontend use

export type PropertyType = 'HOTEL' | 'CAFE' | 'RESIDENTIAL'
export type UnitStatus = 'OCCUPIED' | 'VACANT' | 'MAINTENANCE'
export type BookingChannel = 'BOOKING_COM' | 'EXPEDIA' | 'AIRBNB' | 'DIRECT' | 'PHONE'
export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
export type ExpenseCategory = 'UTILITIES' | 'MAINTENANCE' | 'SUPPLIES' | 'PAYROLL' | 'INSURANCE' | 'TAXES' | 'MARKETING' | 'PROFESSIONAL_FEES' | 'OTHER'
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'
export type AlertCategory = 'MAINTENANCE' | 'FINANCIAL' | 'COMPLIANCE' | 'OCCUPANCY' | 'OPERATIONAL'

export interface Property {
  id: string
  name: string
  type: PropertyType
  address: string
  city: string
  postcode: string
  description?: string
  imageUrl?: string
  purchasePrice?: number
  currentValue?: number
  mortgageBalance?: number
  interestRate?: number
  units?: Unit[]
}

export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  floor?: number
  type?: string
  status: UnitStatus
  currentRate: number
  squareMeters?: number
  bedrooms?: number
  bathrooms?: number
  features?: string[]
}

export interface Booking {
  id: string
  unitId: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  adults: number
  children: number
  checkIn: Date
  checkOut: Date
  nights: number
  channel: BookingChannel
  status: BookingStatus
  roomRate: number
  totalPrice: number
  deposit: number
  balance: number
  specialRequests?: string
}

export interface Lease {
  id: string
  unitId: string
  tenantName: string
  tenantEmail?: string
  tenantPhone?: string
  startDate: Date
  endDate: Date
  rentAmount: number
  deposit: number
  paymentStatus: PaymentStatus
  arrearsAmount: number
  lastPaymentDate?: Date
  rightToRentCheck: boolean
  gasCertExpiry?: Date
  epcRating?: string
}

export interface DailyLog {
  id: string
  propertyId: string
  date: Date
  salesTotal: number
  roomRevenue: number
  fbRevenue: number
  otherRevenue: number
  laborCost: number
  foodCost: number
  utilityCost: number
  otherCost: number
  covers: number
  occupancy?: number
  adr?: number
  revpar?: number
  notes?: string
}

export interface ActionItem {
  id: string
  title: string
  description?: string
  priority: Priority
  status: ActionStatus
  estimatedImpactGbp?: number
  urgencyScore?: number
  assignedTo?: string
  dueDate?: Date
  completedAt?: Date
  category?: string
  relatedPropertyId?: string
}

export interface Expense {
  id: string
  propertyId?: string
  amount: number
  category: ExpenseCategory
  vendor: string
  description?: string
  invoiceRef?: string
  status: ExpenseStatus
  dueDate?: Date
  paidDate?: Date
  isRecurring: boolean
}

export interface Debt {
  id: string
  propertyId?: string
  lender: string
  loanType: string
  principal: number
  currentBalance: number
  interestRate: number
  monthlyPayment: number
  startDate: Date
  maturityDate: Date
  isFixed: boolean
  fixedUntil?: Date
}

export interface Alert {
  id: string
  propertyId?: string
  title: string
  message: string
  severity: AlertSeverity
  category: AlertCategory
  isRead: boolean
  isDismissed: boolean
  source?: string
  relatedType?: string
  relatedId?: string
  createdAt: Date
}

export interface CashPosition {
  id: string
  date: Date
  operatingBalance: number
  reserveBalance: number
  inflows: number
  outflows: number
  projected30Day?: number
  projected90Day?: number
}

export interface Forecast {
  id: string
  date: Date
  propertyId?: string
  predictedRevenue?: number
  predictedOccupancy?: number
  predictedCovers?: number
  confidenceLevel?: number
}

// Dashboard Summary Types
export interface DashboardSummary {
  cashPosition: CashPosition
  alerts: Alert[]
  topActions: ActionItem[]
  forecast30Day: number
  hotelMetrics: HotelMetrics
  cafeMetrics: CafeMetrics
  portfolioMetrics: PortfolioMetrics
}

export interface HotelMetrics {
  occupancyRate: number
  adr: number
  revpar: number
  arrivalsToday: number
  departuresToday: number
  revenueToday: number
  revenueMTD: number
}

export interface CafeMetrics {
  salesToday: number
  salesMTD: number
  coversToday: number
  laborPercentage: number
  foodCostPercentage: number
  grossMargin: number
}

export interface PortfolioMetrics {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  totalRentRoll: number
  totalArrears: number
  complianceIssues: number
}

