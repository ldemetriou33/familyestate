'use server'

import { prisma } from '@/lib/db'

export interface PortfolioData {
  properties: {
    id: string
    name: string
    type: string
    address: string
    city: string
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    monthlyRentRoll: number
    totalArrears: number
  }[]
  rentRoll: {
    id: string
    unitNumber: string
    propertyName: string
    tenantName: string
    monthlyRent: number
    paymentStatus: string
    arrearsAmount: number
    arrearsDays: number
    nextDueDate: Date
    leaseEnd: Date
  }[]
  summary: {
    totalProperties: number
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    maintenanceUnits: number
    occupancyRate: number
    totalRentRoll: number
    totalArrears: number
    arrearsRate: number
    leaseExpiringCount: number
  }
}

/**
 * Fetch all portfolio data for the Portfolio section
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  // Get residential properties with their units
  const properties = await prisma.property.findMany({
    where: { type: 'RESIDENTIAL' },
    include: {
      units: {
        include: {
          rentRolls: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  // Get all active rent rolls
  const rentRolls = await prisma.rentRoll.findMany({
    where: { isActive: true },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
    orderBy: [
      { arrearsAmount: 'desc' },
      { nextDueDate: 'asc' },
    ],
  })

  // Get unit stats
  const unitStats = await prisma.unit.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: {
      property: { type: 'RESIDENTIAL' },
    },
  })

  // Calculate lease expiring within 60 days
  const sixtyDaysFromNow = new Date()
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60)

  const leaseExpiringCount = await prisma.rentRoll.count({
    where: {
      isActive: true,
      leaseEnd: { lte: sixtyDaysFromNow },
    },
  })

  // Calculate summaries
  let totalUnits = 0
  let occupiedUnits = 0
  let vacantUnits = 0
  let maintenanceUnits = 0
  for (const stat of unitStats) {
    totalUnits += stat._count._all
    if (stat.status === 'OCCUPIED') occupiedUnits = stat._count._all
    if (stat.status === 'VACANT') vacantUnits = stat._count._all
    if (stat.status === 'MAINTENANCE') maintenanceUnits = stat._count._all
  }

  let totalRentRoll = 0
  let totalArrears = 0
  for (const roll of rentRolls) {
    totalRentRoll += roll.monthlyRent
    totalArrears += roll.arrearsAmount
  }

  // Build properties array
  const propertiesResult: PortfolioData['properties'] = []
  for (const p of properties) {
    let occupiedCount = 0
    let vacantCount = 0
    let propertyRentRoll = 0
    let propertyArrears = 0
    
    for (const unit of p.units) {
      if (unit.status === 'OCCUPIED') occupiedCount++
      if (unit.status === 'VACANT') vacantCount++
      propertyRentRoll += unit.rentRolls[0]?.monthlyRent || 0
      propertyArrears += unit.rentRolls[0]?.arrearsAmount || 0
    }

    propertiesResult.push({
      id: p.id,
      name: p.name,
      type: p.type,
      address: p.address,
      city: p.city,
      totalUnits: p.units.length,
      occupiedUnits: occupiedCount,
      vacantUnits: vacantCount,
      monthlyRentRoll: propertyRentRoll,
      totalArrears: propertyArrears,
    })
  }

  // Build rent roll array
  const rentRollResult: PortfolioData['rentRoll'] = []
  for (const r of rentRolls) {
    rentRollResult.push({
      id: r.id,
      unitNumber: r.unit.unitNumber,
      propertyName: r.unit.property?.name || 'Unknown',
      tenantName: r.tenantName,
      monthlyRent: r.monthlyRent,
      paymentStatus: r.paymentStatus,
      arrearsAmount: r.arrearsAmount,
      arrearsDays: r.arrearsDays,
      nextDueDate: r.nextDueDate,
      leaseEnd: r.leaseEnd,
    })
  }

  return {
    properties: propertiesResult,

    rentRoll: rentRollResult,

    summary: {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
      totalRentRoll,
      totalArrears,
      arrearsRate: totalRentRoll > 0 ? (totalArrears / totalRentRoll) * 100 : 0,
      leaseExpiringCount,
    },
  }
}

/**
 * Get rent roll for a specific property
 */
export async function getPropertyRentRoll(propertyId: string) {
  const rentRolls = await prisma.rentRoll.findMany({
    where: {
      isActive: true,
      unit: { propertyId },
    },
    include: {
      unit: true,
    },
    orderBy: { nextDueDate: 'asc' },
  })

  const result: Array<{
    id: string
    unitNumber: string
    tenantName: string
    tenantEmail: string | null
    tenantPhone: string | null
    monthlyRent: number
    paymentStatus: string
    arrearsAmount: number
    arrearsDays: number
    lastPaymentDate: Date | null
    nextDueDate: Date
    leaseStart: Date
    leaseEnd: Date
    depositHeld: number
  }> = []

  for (const r of rentRolls) {
    result.push({
      id: r.id,
      unitNumber: r.unit.unitNumber,
      tenantName: r.tenantName,
      tenantEmail: r.tenantEmail,
      tenantPhone: r.tenantPhone,
      monthlyRent: r.monthlyRent,
      paymentStatus: r.paymentStatus,
      arrearsAmount: r.arrearsAmount,
      arrearsDays: r.arrearsDays,
      lastPaymentDate: r.lastPaymentDate,
      nextDueDate: r.nextDueDate,
      leaseStart: r.leaseStart,
      leaseEnd: r.leaseEnd,
      depositHeld: r.depositHeld,
    })
  }

  return result
}

