'use server'

import { prisma } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'
import Papa from 'papaparse'

interface RentRollRow {
  UnitNumber: string
  TenantName: string
  TenantEmail?: string
  TenantPhone?: string
  LeaseStart: string
  LeaseEnd: string
  MonthlyRent: string
  PaymentStatus?: string
  ArrearsAmount?: string
  LastPaymentDate?: string
  NextDueDate?: string
}

interface UploadResult {
  success: boolean
  message: string
  imported: number
  updated: number
  arrearsCount: number
  errors: string[]
}

/**
 * Update tenant status and flag arrears
 */
export async function uploadRentRoll(
  formData: FormData
): Promise<UploadResult> {
  const file = formData.get('file') as File | null
  const propertyId = formData.get('propertyId') as string | null

  if (!file) {
    return {
      success: false,
      message: 'No file provided',
      imported: 0,
      updated: 0,
      arrearsCount: 0,
      errors: ['No file provided'],
    }
  }

  if (!propertyId) {
    return {
      success: false,
      message: 'Property ID required',
      imported: 0,
      updated: 0,
      arrearsCount: 0,
      errors: ['Property ID required'],
    }
  }

  try {
    const text = await file.text()
    
    const { data, errors: parseErrors } = Papa.parse<RentRollRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (parseErrors.length > 0) {
      return {
        success: false,
        message: 'CSV parsing failed',
        imported: 0,
        updated: 0,
        arrearsCount: 0,
        errors: parseErrors.map(e => e.message),
      }
    }

    let imported = 0
    let updated = 0
    let arrearsCount = 0
    const errors: string[] = []

    for (const row of data) {
      try {
        // Find or create unit
        let unit = await prisma.unit.findFirst({
          where: {
            propertyId,
            unitNumber: row.UnitNumber,
          },
        })

        if (!unit) {
          // Create unit if doesn't exist
          unit = await prisma.unit.create({
            data: {
              propertyId,
              unitNumber: row.UnitNumber,
              status: 'OCCUPIED',
              currentRate: parseFloat(row.MonthlyRent?.replace(/[£,]/g, '') || '0'),
            },
          })
        }

        // Parse dates
        const parseDate = (dateStr: string): Date | null => {
          if (!dateStr) return null
          const parts = dateStr.split('/')
          if (parts.length === 3) {
            return new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            )
          }
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date
        }

        const leaseStart = parseDate(row.LeaseStart)
        const leaseEnd = parseDate(row.LeaseEnd)
        const lastPaymentDate = parseDate(row.LastPaymentDate || '')
        const nextDueDate = parseDate(row.NextDueDate || '') || new Date()

        if (!leaseStart || !leaseEnd) {
          errors.push(`Invalid dates for unit ${row.UnitNumber}`)
          continue
        }

        // Parse payment status
        const statusMap: Record<string, PaymentStatus> = {
          'paid': 'PAID',
          'partial': 'PARTIAL',
          'overdue': 'OVERDUE',
          'pending': 'PENDING',
        }
        const paymentStatus = statusMap[row.PaymentStatus?.toLowerCase() || 'pending'] || 'PENDING'

        // Parse arrears
        const arrearsAmount = parseFloat(row.ArrearsAmount?.replace(/[£,]/g, '') || '0')
        const monthlyRent = parseFloat(row.MonthlyRent?.replace(/[£,]/g, '') || '0')

        // Calculate arrears days
        let arrearsDays = 0
        if (arrearsAmount > 0 && lastPaymentDate) {
          arrearsDays = Math.floor((Date.now() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24))
        }

        // Check for existing rent roll entry
        const existingRentRoll = await prisma.rentRoll.findFirst({
          where: {
            unitId: unit.id,
            isActive: true,
          },
        })

        if (existingRentRoll) {
          await prisma.rentRoll.update({
            where: { id: existingRentRoll.id },
            data: {
              tenantName: row.TenantName,
              tenantEmail: row.TenantEmail || null,
              tenantPhone: row.TenantPhone || null,
              leaseStart,
              leaseEnd,
              monthlyRent,
              paymentStatus,
              arrearsAmount,
              arrearsDays,
              lastPaymentDate,
              nextDueDate,
            },
          })
          updated++
        } else {
          await prisma.rentRoll.create({
            data: {
              unitId: unit.id,
              tenantName: row.TenantName,
              tenantEmail: row.TenantEmail || null,
              tenantPhone: row.TenantPhone || null,
              leaseStart,
              leaseEnd,
              monthlyRent,
              paymentStatus,
              arrearsAmount,
              arrearsDays,
              lastPaymentDate,
              nextDueDate,
              isActive: true,
            },
          })
          imported++
        }

        // Count arrears
        if (arrearsAmount > 0) {
          arrearsCount++
        }

        // Update unit status
        await prisma.unit.update({
          where: { id: unit.id },
          data: {
            status: 'OCCUPIED',
            currentRate: monthlyRent,
          },
        })

      } catch (rowError) {
        errors.push(`Row error (${row.UnitNumber}): ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }

    return {
      success: true,
      message: `Imported ${imported}, updated ${updated} records. ${arrearsCount} units with arrears.`,
      imported,
      updated,
      arrearsCount,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      imported: 0,
      updated: 0,
      arrearsCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

