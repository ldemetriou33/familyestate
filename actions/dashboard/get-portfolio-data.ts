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
  const totalUnits = unitStats.reduce((sum: number, s) => sum + s._count._all, 0)
  const occupiedUnits = unitStats.find(s => s.status === 'OCCUPIED')?._count._all || 0
  const vacantUnits = unitStats.find(s => s.status === 'VACANT')?._count._all || 0
  const maintenanceUnits = unitStats.find(s => s.status === 'MAINTENANCE')?._count._all || 0

  const totalRentRoll = rentRolls.reduce((sum: number, r) => sum + r.monthlyRent, 0)
  const totalArrears = rentRolls.reduce((sum: number, r) => sum + r.arrearsAmount, 0)

  return {
    properties: properties.map(p => {
      const occupiedCount = p.units.filter(u => u.status === 'OCCUPIED').length
      const vacantCount = p.units.filter(u => u.status === 'VACANT').length
      const propertyRentRoll = p.units.reduce((sum: number, u) => 
        sum + (u.rentRolls[0]?.monthlyRent || 0), 0
      )
      const propertyArrears = p.units.reduce((sum: number, u) => 
        sum + (u.rentRolls[0]?.arrearsAmount || 0), 0
      )

      return {
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
      }
    }),

    rentRoll: rentRolls.map(r => ({
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
    })),

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

  return rentRolls.map(r => ({
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
  }))
}

