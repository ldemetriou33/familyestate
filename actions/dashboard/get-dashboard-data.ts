'use server'

import { prisma } from '@/lib/prisma'

// ============================================
// PORTFOLIO OVERVIEW DATA
// ============================================

export async function getPortfolioOverview() {
  const [properties, units, debts, recentTransactions] = await Promise.all([
    prisma.property.findMany({
      include: {
        _count: { select: { units: true } },
      },
    }),
    prisma.unit.findMany({
      include: {
        property: true,
        rentRolls: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.debt.findMany(),
    prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ])

  // Calculate totals
  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0)
  const totalDebt = debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0)
  const totalEquity = totalValue - totalDebt
  
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
  const totalUnits = units.length
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
  
  // Calculate monthly income from rent rolls
  const monthlyIncome = units.reduce((sum, u) => {
    if (u.status === 'OCCUPIED' && u.rentRolls[0]) {
      return sum + (u.rentRolls[0].monthlyRent || 0)
    }
    return sum + (u.status === 'OCCUPIED' ? u.currentRate : 0)
  }, 0)

  // Group properties by type
  const byType = {
    residential: properties.filter(p => p.type === 'RESIDENTIAL'),
    hotel: properties.filter(p => p.type === 'HOTEL'),
    cafe: properties.filter(p => p.type === 'CAFE'),
  }

  return {
    totalProperties: properties.length,
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate,
    totalValue,
    totalDebt,
    totalEquity,
    monthlyIncome,
    ltv: totalValue > 0 ? (totalDebt / totalValue) * 100 : 0,
    byType,
    properties,
    recentTransactions,
  }
}

// ============================================
// HOTEL DATA
// ============================================

export async function getHotelData() {
  const hotelProperty = await prisma.property.findFirst({
    where: { type: 'HOTEL' },
    include: {
      units: {
        include: {
          bookings: {
            where: {
              OR: [
                { status: 'CHECKED_IN' },
                { 
                  status: 'CONFIRMED',
                  checkIn: { lte: new Date() },
                  checkOut: { gte: new Date() },
                },
              ],
            },
            orderBy: { checkIn: 'desc' },
            take: 1,
          },
        },
        orderBy: { unitNumber: 'asc' },
      },
      hotelMetrics: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  })

  if (!hotelProperty) {
    return null
  }

  const rooms = hotelProperty.units
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED' || r.bookings.length > 0).length
  const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length
  const vacantRooms = totalRooms - occupiedRooms - maintenanceRooms

  // Today's metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMetric = hotelProperty.hotelMetrics.find(m => 
    new Date(m.date).toDateString() === today.toDateString()
  )

  // Week's metrics
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekMetrics = hotelProperty.hotelMetrics.filter(m => 
    new Date(m.date) >= weekAgo
  )

  const avgOccupancy = weekMetrics.length > 0
    ? weekMetrics.reduce((sum, m) => sum + (m.occupancy || 0), 0) / weekMetrics.length
    : 0

  const avgAdr = weekMetrics.length > 0
    ? weekMetrics.reduce((sum, m) => sum + (m.adr || 0), 0) / weekMetrics.length
    : 0

  const weekRevenue = weekMetrics.reduce((sum, m) => sum + (m.totalRevenue || 0), 0)

  return {
    property: hotelProperty,
    rooms: rooms.map(r => ({
      id: r.id,
      number: r.unitNumber,
      type: r.type || 'Standard',
      status: r.status,
      rate: r.currentRate,
      currentGuest: r.bookings[0]?.guestName || null,
      checkOut: r.bookings[0]?.checkOut || null,
    })),
    summary: {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      maintenanceRooms,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
    },
    todayMetrics: todayMetric || {
      occupancy: (occupiedRooms / totalRooms) * 100,
      adr: avgAdr,
      revpar: avgAdr * (occupiedRooms / totalRooms),
      totalRevenue: 0,
    },
    weekSummary: {
      avgOccupancy,
      avgAdr,
      weekRevenue,
    },
    historicalMetrics: hotelProperty.hotelMetrics.map(m => ({
      date: m.date,
      occupancy: m.occupancy,
      adr: m.adr,
      revpar: m.revpar,
      revenue: m.totalRevenue,
    })),
  }
}

// ============================================
// CAFE DATA
// ============================================

export async function getCafeData() {
  const cafeProperty = await prisma.property.findFirst({
    where: { type: 'CAFE' },
    include: {
      cafeSales: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  })

  if (!cafeProperty) {
    return null
  }

  const sales = cafeProperty.cafeSales

  // Today's sales
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySales = sales.find(s => 
    new Date(s.date).toDateString() === today.toDateString()
  )

  // This week's sales
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekSales = sales.filter(s => new Date(s.date) >= weekAgo)
  const weekTotal = weekSales.reduce((sum, s) => sum + (s.grossSales || 0), 0)
  const weekCovers = weekSales.reduce((sum, s) => sum + (s.covers || 0), 0)

  // Monthly target (£15k/week = £60k/month approximate)
  const monthlyTarget = 60000
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthSales = sales.filter(s => new Date(s.date) >= monthStart)
  const monthTotal = monthSales.reduce((sum, s) => sum + (s.grossSales || 0), 0)
  const monthProgress = (monthTotal / monthlyTarget) * 100

  return {
    property: cafeProperty,
    todaySales: todaySales || { grossSales: 0, covers: 0, avgSpend: 0 },
    weekSummary: {
      totalSales: weekTotal,
      totalCovers: weekCovers,
      avgDailySales: weekSales.length > 0 ? weekTotal / weekSales.length : 0,
    },
    monthSummary: {
      totalSales: monthTotal,
      target: monthlyTarget,
      progress: monthProgress,
      daysRemaining: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate(),
    },
    historicalSales: sales.map(s => ({
      date: s.date,
      grossSales: s.grossSales,
      covers: s.covers,
      avgSpend: s.avgSpend,
    })),
  }
}

// ============================================
// RESIDENTIAL DATA
// ============================================

export async function getResidentialData() {
  const residentialProperties = await prisma.property.findMany({
    where: { type: 'RESIDENTIAL' },
    include: {
      units: {
        include: {
          rentRolls: {
            orderBy: { nextDueDate: 'desc' },
            take: 1,
          },
          leases: {
            where: {
              endDate: { gte: new Date() },
            },
            orderBy: { endDate: 'asc' },
            take: 1,
          },
        },
      },
      debts: true,
    },
    orderBy: { name: 'asc' },
  })

  const allUnits = residentialProperties.flatMap(p => p.units)
  const totalUnits = allUnits.length
  const occupiedUnits = allUnits.filter(u => u.status === 'OCCUPIED').length
  
  // Calculate totals
  const totalValue = residentialProperties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0)
  const totalDebt = residentialProperties.reduce((sum, p) => 
    sum + p.debts.reduce((d, debt) => d + (debt.currentBalance || 0), 0), 0
  )
  const monthlyRent = allUnits
    .filter(u => u.status === 'OCCUPIED')
    .reduce((sum, u) => sum + (u.rentRolls[0]?.monthlyRent || u.currentRate || 0), 0)

  // Arrears
  const unitsInArrears = allUnits.filter(u => 
    u.rentRolls[0]?.paymentStatus === 'OVERDUE'
  )
  const totalArrears = unitsInArrears.reduce((sum, u) => 
    sum + (u.rentRolls[0]?.monthlyRent || 0), 0
  )

  // Leases expiring soon (within 90 days)
  const ninetyDaysFromNow = new Date()
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
  const expiringLeases = allUnits.filter(u => 
    u.leases[0] && new Date(u.leases[0].endDate) <= ninetyDaysFromNow
  )

  return {
    properties: residentialProperties.map(p => ({
      id: p.id,
      name: p.name,
      city: p.city,
      postcode: p.postcode,
      value: p.currentValue || p.purchasePrice,
      mortgageBalance: p.mortgageBalance,
      interestRate: p.interestRate,
      units: p.units.map(u => ({
        id: u.id,
        unitNumber: u.unitNumber,
        status: u.status,
        currentRate: u.currentRate,
        tenant: u.rentRolls[0]?.tenantName || null,
        rentStatus: u.rentRolls[0]?.paymentStatus || null,
        leaseEnd: u.leases[0]?.endDate || null,
      })),
    })),
    summary: {
      totalProperties: residentialProperties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
      totalValue,
      totalDebt,
      equity: totalValue - totalDebt,
      monthlyRent,
      annualYield: totalValue > 0 ? ((monthlyRent * 12) / totalValue) * 100 : 0,
    },
    alerts: {
      unitsInArrears: unitsInArrears.length,
      totalArrears,
      expiringLeases: expiringLeases.length,
    },
  }
}

// ============================================
// FINANCE DATA
// ============================================

export async function getFinanceData() {
  const [cashPositions, debts, expenses, transactions] = await Promise.all([
    prisma.cashPosition.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    }),
    prisma.debt.findMany({
      include: { property: true },
    }),
    prisma.expense.findMany({
      where: {
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' },
      take: 20,
    }),
  ])

  const latestCash = (cashPositions[0]?.operatingBalance || 0) + (cashPositions[0]?.reserveBalance || 0)
  const totalDebt = debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0)
  const monthlyDebtService = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0)
  
  const monthExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const avgMonthlyExpenses = monthExpenses // This month so far

  // Upcoming payments
  const upcomingPayments = debts
    .filter(d => d.nextPaymentDate)
    .map(d => ({
      name: d.name,
      amount: d.monthlyPayment,
      dueDate: d.nextPaymentDate,
      property: d.property?.name,
    }))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  return {
    cashPosition: latestCash,
    cashHistory: cashPositions.map(c => ({
      date: c.date,
      balance: c.operatingBalance + c.reserveBalance,
    })),
    totalDebt,
    monthlyDebtService,
    debts: debts.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      balance: d.currentBalance,
      interestRate: d.interestRate,
      monthlyPayment: d.monthlyPayment,
      lender: d.lender,
      maturityDate: d.maturityDate,
      propertyName: d.property?.name,
    })),
    monthlyExpenses: avgMonthlyExpenses,
    recentExpenses: expenses.slice(0, 10),
    recentTransactions: transactions,
    upcomingPayments: upcomingPayments.slice(0, 5),
  }
}

// ============================================
// ALERTS DATA
// ============================================

export async function getAlertsData() {
  const alerts = await prisma.alert.findMany({
    where: {
      acknowledged: false,
    },
    include: {
      property: true,
    },
    orderBy: [
      { severity: 'asc' }, // CRITICAL first
      { createdAt: 'desc' },
    ],
    take: 20,
  })

  // Generate system alerts based on data
  const systemAlerts: Array<{
    id: string
    type: string
    severity: 'CRITICAL' | 'WARNING' | 'INFO'
    title: string
    message: string
    createdAt: Date
  }> = []

  // Check for overdue rent
  const overdueRent = await prisma.rentRoll.findMany({
    where: { status: 'OVERDUE' },
    include: { unit: { include: { property: true } } },
  })

  if (overdueRent.length > 0) {
    systemAlerts.push({
      id: 'overdue-rent',
      type: 'FINANCIAL',
      severity: 'WARNING',
      title: 'Overdue Rent',
      message: `${overdueRent.length} unit(s) have overdue rent payments`,
      createdAt: new Date(),
    })
  }

  // Check for expiring leases
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  const expiringLeases = await prisma.lease.findMany({
    where: {
      endDate: { 
        gte: new Date(),
        lte: thirtyDaysFromNow,
      },
    },
    include: { unit: { include: { property: true } } },
  })

  if (expiringLeases.length > 0) {
    systemAlerts.push({
      id: 'expiring-leases',
      type: 'COMPLIANCE',
      severity: 'INFO',
      title: 'Leases Expiring Soon',
      message: `${expiringLeases.length} lease(s) expiring in the next 30 days`,
      createdAt: new Date(),
    })
  }

  return {
    alerts: [...alerts.map(a => ({
      id: a.id,
      type: a.category,
      severity: a.severity,
      title: a.title,
      message: a.message,
      property: a.property?.name,
      createdAt: a.createdAt,
    })), ...systemAlerts],
    counts: {
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
      info: alerts.filter(a => a.severity === 'INFO').length,
    },
  }
}

// ============================================
// COMBINED DASHBOARD DATA
// ============================================

export async function getDashboardData() {
  const [portfolio, hotel, cafe, residential, finance, alerts] = await Promise.all([
    getPortfolioOverview(),
    getHotelData(),
    getCafeData(),
    getResidentialData(),
    getFinanceData(),
    getAlertsData(),
  ])

  return {
    portfolio,
    hotel,
    cafe,
    residential,
    finance,
    alerts,
    lastUpdated: new Date(),
  }
}

