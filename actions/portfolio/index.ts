'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PropertyType, UnitStatus, DataSource, DataConfidence } from '@prisma/client'

// ============================================
// PROPERTY TYPES
// ============================================

export interface PropertyFormData {
  id?: string
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
  mortgageLender?: string
  mortgageType?: string
  mortgageTermEndDate?: Date
}

export interface UnitFormData {
  id?: string
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

// ============================================
// GET OPERATIONS
// ============================================

export async function getProperties() {
  const properties = await prisma.property.findMany({
    include: {
      units: {
        include: {
          rentRolls: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          bookings: {
            where: {
              checkOut: { gte: new Date() },
              status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            },
            orderBy: { checkIn: 'asc' },
            take: 1,
          },
        },
      },
      debts: true,
      _count: {
        select: { units: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return properties
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      units: {
        include: {
          rentRolls: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          bookings: {
            orderBy: { checkIn: 'desc' },
            take: 5,
          },
        },
      },
      debts: true,
      hotelMetrics: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      cafeSales: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      expenses: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  return property
}

export async function getUnits(propertyId?: string) {
  const units = await prisma.unit.findMany({
    where: propertyId ? { propertyId } : undefined,
    include: {
      property: true,
      rentRolls: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      bookings: {
        where: {
          checkOut: { gte: new Date() },
        },
        orderBy: { checkIn: 'asc' },
        take: 1,
      },
    },
    orderBy: [{ propertyId: 'asc' }, { unitNumber: 'asc' }],
  })

  return units
}

export async function getPortfolioSummary() {
  const [properties, totalUnits, occupiedUnits, totalDebt, monthlyIncome] = await Promise.all([
    prisma.property.count(),
    prisma.unit.count(),
    prisma.unit.count({ where: { status: 'OCCUPIED' } }),
    prisma.debt.aggregate({
      _sum: { currentBalance: true },
    }),
    prisma.rentRoll.aggregate({
      where: {
        paymentStatus: { in: ['PAID', 'PARTIAL'] },
      },
      _sum: { monthlyRent: true },
    }),
  ])

  // Get property values
  const propertyValues = await prisma.property.aggregate({
    _sum: { currentValue: true, purchasePrice: true, mortgageBalance: true },
  })

  return {
    totalProperties: properties,
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
    totalDebt: totalDebt._sum.currentBalance || 0,
    monthlyIncome: monthlyIncome._sum.monthlyRent || 0,
    totalValue: propertyValues._sum.currentValue || propertyValues._sum.purchasePrice || 0,
    totalEquity: (propertyValues._sum.currentValue || 0) - (propertyValues._sum.mortgageBalance || 0),
  }
}

// ============================================
// CREATE OPERATIONS
// ============================================

export async function createProperty(data: PropertyFormData) {
  const property = await prisma.property.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
      city: data.city,
      postcode: data.postcode,
      description: data.description,
      imageUrl: data.imageUrl,
      purchasePrice: data.purchasePrice,
      currentValue: data.currentValue,
      mortgageBalance: data.mortgageBalance,
      interestRate: data.interestRate,
      mortgageLender: data.mortgageLender,
      mortgageType: data.mortgageType,
      mortgageTermEndDate: data.mortgageTermEndDate,
      dataSource: DataSource.MANUAL,
      lastUpdatedAt: new Date(),
    },
  })

  // Create associated debt record if mortgage exists
  if (data.mortgageBalance && data.mortgageBalance > 0) {
    await prisma.debt.create({
      data: {
        propertyId: property.id,
        lender: data.mortgageLender || 'Unknown Lender',
        loanType: data.mortgageType || 'MORTGAGE',
        principal: data.mortgageBalance,
        currentBalance: data.mortgageBalance,
        interestRate: data.interestRate || 0,
        monthlyPayment: calculateMortgagePayment(data.mortgageBalance, data.interestRate || 5, 25),
        startDate: new Date(),
        maturityDate: data.mortgageTermEndDate || new Date(Date.now() + 25 * 365 * 24 * 60 * 60 * 1000),
        isFixed: data.mortgageType === 'FIXED',
        notes: `Mortgage for ${data.name}`,
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return property
}

export async function createUnit(data: UnitFormData) {
  const unit = await prisma.unit.create({
    data: {
      propertyId: data.propertyId,
      unitNumber: data.unitNumber,
      floor: data.floor,
      type: data.type,
      status: data.status,
      currentRate: data.currentRate,
      squareMeters: data.squareMeters,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      features: data.features || [],
      dataSource: DataSource.MANUAL,
      lastUpdatedAt: new Date(),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return unit
}

// ============================================
// UPDATE OPERATIONS
// ============================================

export async function updateProperty(id: string, data: Partial<PropertyFormData>) {
  const property = await prisma.property.update({
    where: { id },
    data: {
      ...data,
      lastUpdatedAt: new Date(),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return property
}

export async function updateUnit(id: string, data: Partial<UnitFormData>) {
  const unit = await prisma.unit.update({
    where: { id },
    data: {
      ...data,
      lastUpdatedAt: new Date(),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return unit
}

// ============================================
// DELETE OPERATIONS
// ============================================

export async function deleteProperty(id: string) {
  await prisma.property.delete({
    where: { id },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return { success: true }
}

export async function deleteUnit(id: string) {
  await prisma.unit.delete({
    where: { id },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return { success: true }
}

// ============================================
// DAILY LOG OPERATIONS
// ============================================

export async function getDailyLogs(propertyId?: string, limit: number = 7) {
  const logs = await prisma.dailyLog.findMany({
    where: propertyId ? { propertyId } : undefined,
    include: {
      property: true,
    },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return logs
}

export async function createDailyLog(data: {
  propertyId?: string
  date: Date
  notes: string
  weather?: string
  mood?: string
}) {
  if (!data.propertyId) {
    throw new Error('propertyId is required for DailyLog')
  }

  // Combine notes with mood and weather if provided
  let notes = data.notes
  if (data.mood) {
    notes = `${notes}\nMood: ${data.mood}`
  }
  if (data.weather) {
    notes = `${notes}\nWeather: ${data.weather}`
  }

  const log = await prisma.dailyLog.create({
    data: {
      propertyId: data.propertyId,
      date: data.date,
      notes,
    },
  })

  revalidatePath('/dashboard')

  return log
}

// ============================================
// SEED DATA (For initial setup)
// ============================================

export async function seedPortfolioData() {
  // Allow re-seeding - delete existing data first
  try {
    await prisma.rentRoll.deleteMany({})
    await prisma.unit.deleteMany({})
    await prisma.debt.deleteMany({})
    await prisma.property.deleteMany({})
  } catch (error) {
    console.error('Error clearing existing data:', error)
  }

  // Create Hotel (from lib/constants.ts)
  const hotel = await prisma.property.create({
    data: {
      name: 'The Grand Abbey Hotel',
      type: 'HOTEL',
      address: '15 Abbey Road',
      city: 'London',
      postcode: 'SW1A 1AA',
      purchasePrice: 12500000,
      currentValue: 14200000,
      mortgageBalance: 8750000,
      interestRate: 4.85,
      mortgageLender: 'Barclays Commercial',
      mortgageType: 'FIXED',
      dataSource: DataSource.MANUAL,
    },
  })

  // Create hotel rooms (24 rooms)
  for (let i = 1; i <= 24; i++) {
    await prisma.unit.create({
      data: {
        propertyId: hotel.id,
        unitNumber: `${100 + i}`,
        floor: Math.floor((i - 1) / 6) + 1,
        type: i <= 18 ? 'Standard' : 'Suite',
        status: i <= 18 ? 'OCCUPIED' : 'VACANT',
        currentRate: i <= 18 ? 150 : 250,
        squareMeters: i <= 18 ? 25 : 40,
        bedrooms: 1,
        bathrooms: 1,
      },
    })
  }

  // Create Cafe (from lib/constants.ts)
  const cafe = await prisma.property.create({
    data: {
      name: 'Abbey Café',
      type: 'CAFE',
      address: '17 Abbey Road',
      city: 'London',
      postcode: 'SW1A 1AA',
      purchasePrice: 450000,
      currentValue: 520000,
      mortgageBalance: 315000,
      interestRate: 5.50,
      mortgageLender: 'HSBC',
      mortgageType: 'FIXED',
      dataSource: DataSource.MANUAL,
    },
  })

  // Create 12 Residential Properties (exact data from lib/constants.ts)
  const residentialData = [
    { name: 'London Flat - Kensington', address: 'Kensington High Street', city: 'London', postcode: 'SW7 1AA', purchasePrice: 850000, currentValue: 950000, mortgageBalance: 595000, interestRate: 5.25, mortgageType: 'FIXED' as const, monthlyRent: 3200 },
    { name: 'London Flat - Islington', address: 'Upper Street', city: 'London', postcode: 'N1 1AA', purchasePrice: 625000, currentValue: 700000, mortgageBalance: 437500, interestRate: 5.45, mortgageType: 'VARIABLE' as const, monthlyRent: 2450 },
    { name: 'Manchester House', address: 'Deansgate', city: 'Manchester', postcode: 'M1 1AA', purchasePrice: 285000, currentValue: 320000, mortgageBalance: 199500, interestRate: 5.15, mortgageType: 'FIXED' as const, monthlyRent: 1250 },
    { name: 'Birmingham Apartment', address: 'Broad Street', city: 'Birmingham', postcode: 'B1 1AA', purchasePrice: 195000, currentValue: 220000, mortgageBalance: 136500, interestRate: 5.35, mortgageType: 'VARIABLE' as const, monthlyRent: 850 },
    { name: 'Leeds Terraced House', address: 'Briggate', city: 'Leeds', postcode: 'LS1 1AA', purchasePrice: 165000, currentValue: 185000, mortgageBalance: 115500, interestRate: 5.20, mortgageType: 'FIXED' as const, monthlyRent: 750 },
    { name: 'Bristol Flat', address: 'Park Street', city: 'Bristol', postcode: 'BS1 1AA', purchasePrice: 275000, currentValue: 310000, mortgageBalance: 192500, interestRate: 5.30, mortgageType: 'VARIABLE' as const, monthlyRent: 1100 },
    { name: 'Edinburgh Apartment', address: 'Princes Street', city: 'Edinburgh', postcode: 'EH1 1AA', purchasePrice: 320000, currentValue: 360000, mortgageBalance: 224000, interestRate: 5.10, mortgageType: 'FIXED' as const, monthlyRent: 1350 },
    { name: 'Glasgow House', address: 'Sauchiehall Street', city: 'Glasgow', postcode: 'G1 1AA', purchasePrice: 185000, currentValue: 210000, mortgageBalance: 129500, interestRate: 5.40, mortgageType: 'VARIABLE' as const, monthlyRent: 800 },
    { name: 'Liverpool Terraced', address: 'Bold Street', city: 'Liverpool', postcode: 'L1 1AA', purchasePrice: 145000, currentValue: 165000, mortgageBalance: 101500, interestRate: 5.25, mortgageType: 'FIXED' as const, monthlyRent: 650 },
    { name: 'Newcastle Flat', address: 'Grey Street', city: 'Newcastle', postcode: 'NE1 1AA', purchasePrice: 125000, currentValue: 145000, mortgageBalance: 87500, interestRate: 5.15, mortgageType: 'VARIABLE' as const, monthlyRent: 550 },
    { name: 'Sheffield House', address: 'Fargate', city: 'Sheffield', postcode: 'S1 1AA', purchasePrice: 155000, currentValue: 175000, mortgageBalance: 108500, interestRate: 5.30, mortgageType: 'FIXED' as const, monthlyRent: 700 },
    { name: 'Nottingham Apartment', address: 'Market Square', city: 'Nottingham', postcode: 'NG1 1AA', purchasePrice: 175000, currentValue: 200000, mortgageBalance: 122500, interestRate: 5.20, mortgageType: 'VARIABLE' as const, monthlyRent: 750 },
  ]

  for (const prop of residentialData) {
    const property = await prisma.property.create({
      data: {
        name: prop.name,
        type: 'RESIDENTIAL',
        address: prop.address,
        city: prop.city,
        postcode: prop.postcode,
        purchasePrice: prop.purchasePrice,
        currentValue: prop.currentValue,
        mortgageBalance: prop.mortgageBalance,
        interestRate: prop.interestRate,
        mortgageLender: 'Nationwide',
        mortgageType: prop.mortgageType,
        dataSource: DataSource.MANUAL,
      },
    })

    // Create single unit for residential
    const unit = await prisma.unit.create({
      data: {
        propertyId: property.id,
        unitNumber: '1',
        floor: 1,
        type: 'Flat',
        status: 'OCCUPIED',
        currentRate: prop.monthlyRent,
        squareMeters: 60,
        bedrooms: 2,
        bathrooms: 1,
      },
    })

    // Create active rent roll for the unit
    const leaseStart = new Date()
    leaseStart.setMonth(leaseStart.getMonth() - 6) // Started 6 months ago
    const leaseEnd = new Date()
    leaseEnd.setFullYear(leaseEnd.getFullYear() + 1) // Ends in 1 year
    const nextDueDate = new Date()
    nextDueDate.setDate(1) // First of next month
    if (nextDueDate < new Date()) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1)
    }

    await prisma.rentRoll.create({
      data: {
        unitId: unit.id,
        tenantName: `Tenant - ${prop.name}`,
        monthlyRent: prop.monthlyRent,
        leaseStart,
        leaseEnd,
        nextDueDate,
        isActive: true,
        dataSource: DataSource.MANUAL,
      },
    })
  }

  // Create sample cash position and metrics for Command Center
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.cashPosition.create({
    data: {
      date: today,
      operatingBalance: 125000,
      reserveBalance: 50000,
      inflows: 45000,
      outflows: 32000,
      dataSource: DataSource.MANUAL,
      confidence: DataConfidence.HIGH,
    },
  })

  await prisma.hotelMetric.create({
    data: {
      propertyId: hotel.id,
      date: today,
      roomsAvailable: 24,
      roomsOccupied: 18,
      occupancy: 75,
      adr: 165,
      revpar: 123.75, // ADR * occupancy / 100
      totalRevenue: 2970,
      roomRevenue: 2970,
      arrivals: 3,
      departures: 2,
      dataSource: DataSource.MANUAL,
      confidence: DataConfidence.HIGH,
    },
  })

  await prisma.cafeSales.create({
    data: {
      propertyId: cafe.id,
      date: today,
      grossSales: 2850,
      covers: 142,
      grossMargin: 65,
      labourPercentage: 28,
      dataSource: DataSource.MANUAL,
      confidence: DataConfidence.HIGH,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return { success: true, message: 'Portfolio data seeded successfully' }
}

// ============================================
// DELETE ALL DATA (Remove mock data)
// ============================================

export async function deleteAllPortfolioData() {
  try {
    // Delete in correct order (respecting foreign key constraints)
    await prisma.rentRoll.deleteMany()
    await prisma.unit.deleteMany()
    await prisma.debt.deleteMany()
    await prisma.property.deleteMany()
    
    return { success: true, message: 'All portfolio data deleted successfully' }
  } catch (error) {
    console.error('Failed to delete portfolio data:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete data' 
    }
  }
}

// ============================================
// HELPERS
// ============================================

function calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = years * 12
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1)
}

