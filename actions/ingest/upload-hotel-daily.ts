'use server'

import { prisma } from '@/lib/db'
import Papa from 'papaparse'

interface HotelDailyRow {
  Date: string
  RoomsAvailable?: string
  RoomsOccupied?: string
  Occupancy?: string
  ADR?: string
  RevPAR?: string
  RoomRevenue?: string
  TotalRevenue?: string
  Arrivals?: string
  Departures?: string
}

interface UploadResult {
  success: boolean
  message: string
  imported: number
  updated: number
  errors: string[]
}

/**
 * Parse PMS export, update HotelMetric
 */
export async function uploadHotelDaily(
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
      errors: ['No file provided'],
    }
  }

  if (!propertyId) {
    return {
      success: false,
      message: 'Property ID required',
      imported: 0,
      updated: 0,
      errors: ['Property ID required'],
    }
  }

  try {
    const text = await file.text()
    
    const { data, errors: parseErrors } = Papa.parse<HotelDailyRow>(text, {
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
        errors: parseErrors.map(e => e.message),
      }
    }

    let imported = 0
    let updated = 0
    const errors: string[] = []

    for (const row of data) {
      try {
        // Parse date
        const dateParts = row.Date?.split('/') || []
        let date: Date
        
        if (dateParts.length === 3) {
          date = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0])
          )
        } else {
          date = new Date(row.Date)
        }

        if (isNaN(date.getTime())) {
          errors.push(`Invalid date: ${row.Date}`)
          continue
        }

        // Parse values
        const roomsAvailable = parseInt(row.RoomsAvailable || '0') || 10
        const roomsOccupied = parseInt(row.RoomsOccupied || '0') || 0
        const occupancy = parseFloat(row.Occupancy?.replace('%', '') || '0') || 
          (roomsAvailable > 0 ? (roomsOccupied / roomsAvailable) * 100 : 0)
        const adr = parseFloat(row.ADR?.replace(/[£,]/g, '') || '0')
        const roomRevenue = parseFloat(row.RoomRevenue?.replace(/[£,]/g, '') || '0')
        const totalRevenue = parseFloat(row.TotalRevenue?.replace(/[£,]/g, '') || '0') || roomRevenue
        const revpar = parseFloat(row.RevPAR?.replace(/[£,]/g, '') || '0') || 
          (roomsAvailable > 0 ? roomRevenue / roomsAvailable : 0)
        const arrivals = parseInt(row.Arrivals || '0') || 0
        const departures = parseInt(row.Departures || '0') || 0

        // Upsert metric
        const existing = await prisma.hotelMetric.findUnique({
          where: {
            propertyId_date: {
              propertyId,
              date,
            },
          },
        })

        if (existing) {
          await prisma.hotelMetric.update({
            where: { id: existing.id },
            data: {
              roomsAvailable,
              roomsOccupied,
              occupancy,
              adr,
              revpar,
              totalRevenue,
              roomRevenue,
              otherRevenue: totalRevenue - roomRevenue,
              arrivals,
              departures,
              source: 'PMS',
            },
          })
          updated++
        } else {
          await prisma.hotelMetric.create({
            data: {
              propertyId,
              date,
              roomsAvailable,
              roomsOccupied,
              occupancy,
              adr,
              revpar,
              totalRevenue,
              roomRevenue,
              otherRevenue: totalRevenue - roomRevenue,
              arrivals,
              departures,
              source: 'PMS',
            },
          })
          imported++
        }
      } catch (rowError) {
        errors.push(`Row error: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }

    return {
      success: true,
      message: `Imported ${imported}, updated ${updated} records`,
      imported,
      updated,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      imported: 0,
      updated: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

