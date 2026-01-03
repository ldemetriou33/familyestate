'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PropertyType, UnitStatus, DataSource } from '@prisma/client'

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
  const log = await prisma.dailyLog.create({
    data: {
      propertyId: data.propertyId || undefined,
      date: data.date,
      notes: data.mood ? `${data.notes}\nMood: ${data.mood}` : data.notes,
      weatherNote: data.weather,
    },
  })

  revalidatePath('/dashboard')

  return log
}

// ============================================
// SEED DATA (For initial setup)
// ============================================

export async function seedPortfolioData() {
  // Check if data already exists
  const existingProperties = await prisma.property.count()
  if (existingProperties > 0) {
    return { success: false, message: 'Data already exists' }
  }

  // Create Hotel
  const hotel = await prisma.property.create({
    data: {
      name: 'The Grand Abbey Hotel',
      type: 'HOTEL',
      address: '123 Abbey Road',
      city: 'London',
      postcode: 'SW1A 1AA',
      purchasePrice: 12500000,
      currentValue: 14000000,
      mortgageBalance: 8750000,
      interestRate: 4.85,
      mortgageLender: 'Barclays Commercial',
      mortgageType: 'FIXED',
      dataSource: DataSource.MANUAL,
    },
  })

  // Create hotel rooms
  for (let i = 1; i <= 20; i++) {
    await prisma.unit.create({
      data: {
        propertyId: hotel.id,
        unitNumber: `${100 + i}`,
        floor: Math.floor(i / 5) + 1,
        type: i <= 15 ? 'Standard' : 'Suite',
        status: Math.random() > 0.3 ? 'OCCUPIED' : 'VACANT',
        currentRate: i <= 15 ? 150 : 250,
        squareMeters: i <= 15 ? 25 : 40,
        bedrooms: 1,
        bathrooms: 1,
      },
    })
  }

  // Create Cafe
  await prisma.property.create({
    data: {
      name: 'Abbey Café',
      type: 'CAFE',
      address: '125 Abbey Road',
      city: 'London',
      postcode: 'SW1A 1AA',
      purchasePrice: 450000,
      currentValue: 520000,
      mortgageBalance: 315000,
      interestRate: 5.50,
      dataSource: DataSource.MANUAL,
    },
  })

  // Create 12 Residential Properties
  const residentialData = [
    { name: 'Kensington Flat', city: 'London', postcode: 'SW7 2AA', price: 850000, rent: 3200 },
    { name: 'Islington Flat', city: 'London', postcode: 'N1 8JA', price: 625000, rent: 2450 },
    { name: 'Manchester House', city: 'Manchester', postcode: 'M1 1AA', price: 285000, rent: 1250 },
    { name: 'Birmingham Apartment', city: 'Birmingham', postcode: 'B1 1AA', price: 195000, rent: 850 },
    { name: 'Leeds Terraced', city: 'Leeds', postcode: 'LS1 1AA', price: 165000, rent: 750 },
    { name: 'Bristol Flat', city: 'Bristol', postcode: 'BS1 1AA', price: 275000, rent: 1100 },
    { name: 'Edinburgh Apartment', city: 'Edinburgh', postcode: 'EH1 1AA', price: 320000, rent: 1350 },
    { name: 'Glasgow House', city: 'Glasgow', postcode: 'G1 1AA', price: 185000, rent: 800 },
    { name: 'Liverpool Terraced', city: 'Liverpool', postcode: 'L1 1AA', price: 145000, rent: 650 },
    { name: 'Newcastle Flat', city: 'Newcastle', postcode: 'NE1 1AA', price: 125000, rent: 550 },
    { name: 'Sheffield House', city: 'Sheffield', postcode: 'S1 1AA', price: 155000, rent: 700 },
    { name: 'Nottingham Apartment', city: 'Nottingham', postcode: 'NG1 1AA', price: 175000, rent: 750 },
  ]

  for (const prop of residentialData) {
    const property = await prisma.property.create({
      data: {
        name: prop.name,
        type: 'RESIDENTIAL',
        address: `${Math.floor(Math.random() * 100) + 1} ${prop.city} Street`,
        city: prop.city,
        postcode: prop.postcode,
        purchasePrice: prop.price,
        currentValue: prop.price * 1.1,
        mortgageBalance: prop.price * 0.7,
        interestRate: 5.2 + Math.random() * 0.5,
        dataSource: DataSource.MANUAL,
      },
    })

    // Create single unit for residential
    await prisma.unit.create({
      data: {
        propertyId: property.id,
        unitNumber: 'Main',
        status: Math.random() > 0.15 ? 'OCCUPIED' : 'VACANT',
        currentRate: prop.rent,
        bedrooms: Math.floor(Math.random() * 3) + 1,
        bathrooms: 1,
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/portfolio')

  return { success: true, message: 'Portfolio data seeded successfully' }
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

