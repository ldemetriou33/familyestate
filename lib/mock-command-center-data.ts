// Mock data for Command Center when database is unavailable
import { CommandCenterData } from '@/actions/dashboard/get-command-center-data'

export function getMockCommandCenterData(): CommandCenterData {
  const today = new Date()
  
  return {
    cashPosition: {
      operatingBalance: 125000,
      reserveBalance: 50000,
      totalBalance: 175000,
      inflows: 45000,
      outflows: 32000,
      netMovement: 13000,
      projected30Day: 180000,
      projected90Day: 200000,
    },
    alerts: [
      {
        id: 'alert-1',
        title: 'Low Occupancy Alert',
        message: 'Hotel occupancy below 50% for next week',
        severity: 'WARNING',
        category: 'OCCUPANCY',
        createdAt: new Date(),
        propertyName: 'The Grand Abbey Hotel',
      },
      {
        id: 'alert-2',
        title: 'Rent Arrears',
        message: '2 units have overdue rent payments',
        severity: 'CRITICAL',
        category: 'FINANCE',
        createdAt: new Date(),
        propertyName: null,
      },
    ],
    actionItems: [
      {
        id: 'action-1',
        title: 'Review Hotel Pricing',
        description: 'Consider adjusting rates for low occupancy period',
        priority: 'HIGH',
        status: 'PENDING_APPROVAL',
        category: 'PRICING',
        estimatedImpactGbp: 5000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    metrics: {
      criticalAlerts: 1,
      pendingActions: 3,
      totalImpact: 8500,
      completedToday: 2,
    },
    hotelMetrics: {
      occupancyRate: 75,
      adr: 165,
      revenueToday: 2970,
      arrivals: 3,
      departures: 2,
    },
    cafeMetrics: {
      grossMargin: 65,
      salesToday: 2850,
      coversToday: 142,
      labourPercentage: 28,
    },
    portfolioMetrics: {
      totalUnits: 36,
      occupiedUnits: 30,
      vacantUnits: 6,
      totalRentRoll: 14500,
      totalArrears: 1900,
      arrearsCount: 2,
    },
  }
}

