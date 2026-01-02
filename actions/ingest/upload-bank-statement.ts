'use server'

import { prisma } from '@/lib/db'
import { TransactionCategory } from '@prisma/client'
import Papa from 'papaparse'

interface BankStatementRow {
  Date: string
  Description: string
  Amount: string
  Balance?: string
  Reference?: string
  Category?: string
}

interface UploadResult {
  success: boolean
  message: string
  imported: number
  duplicates: number
  errors: string[]
}

/**
 * Parse CSV, upsert transactions, avoid duplicates
 */
export async function uploadBankStatement(
  formData: FormData
): Promise<UploadResult> {
  const file = formData.get('file') as File | null
  const bankAccountId = formData.get('bankAccountId') as string | null
  const propertyId = formData.get('propertyId') as string | null

  if (!file) {
    return {
      success: false,
      message: 'No file provided',
      imported: 0,
      duplicates: 0,
      errors: ['No file provided'],
    }
  }

  try {
    const text = await file.text()
    
    const { data, errors: parseErrors } = Papa.parse<BankStatementRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (parseErrors.length > 0) {
      return {
        success: false,
        message: 'CSV parsing failed',
        imported: 0,
        duplicates: 0,
        errors: parseErrors.map(e => e.message),
      }
    }

    let imported = 0
    let duplicates = 0
    const errors: string[] = []

    for (const row of data) {
      try {
        // Parse date (handle UK format DD/MM/YYYY)
        const dateParts = row.Date?.split('/') || []
        let date: Date
        
        if (dateParts.length === 3) {
          // UK format: DD/MM/YYYY
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

        // Parse amount
        const amount = parseFloat(row.Amount?.replace(/[£,]/g, '') || '0')
        if (isNaN(amount)) {
          errors.push(`Invalid amount: ${row.Amount}`)
          continue
        }

        // Generate external ID for deduplication
        const externalId = `${date.toISOString().split('T')[0]}-${amount}-${row.Description?.substring(0, 50)}`

        // Check for duplicate
        const existing = await prisma.financialTransaction.findUnique({
          where: { externalId },
        })

        if (existing) {
          duplicates++
          continue
        }

        // Categorize transaction
        const category = categorizeTransaction(row.Description || '', amount)

        // Create transaction
        await prisma.financialTransaction.create({
          data: {
            date,
            amount,
            category,
            description: row.Description || 'Unknown',
            bankAccountId: bankAccountId || undefined,
            bankAccountName: bankAccountId || undefined,
            reference: row.Reference || undefined,
            externalId,
            propertyId: propertyId || undefined,
          },
        })

        imported++
      } catch (rowError) {
        errors.push(`Row error: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }

    return {
      success: true,
      message: `Imported ${imported} transactions, ${duplicates} duplicates skipped`,
      imported,
      duplicates,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      imported: 0,
      duplicates: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

/**
 * Auto-categorize transactions based on description
 */
function categorizeTransaction(description: string, amount: number): TransactionCategory {
  const desc = description.toLowerCase()

  // Income categories
  if (amount > 0) {
    if (desc.includes('rent') || desc.includes('tenant')) return 'RENT_INCOME'
    if (desc.includes('booking') || desc.includes('hotel') || desc.includes('room')) return 'HOTEL_REVENUE'
    if (desc.includes('cafe') || desc.includes('restaurant') || desc.includes('food')) return 'CAFE_REVENUE'
    return 'OTHER_INCOME'
  }

  // Expense categories
  if (desc.includes('mortgage') || desc.includes('loan')) return 'MORTGAGE_PAYMENT'
  if (desc.includes('electric') || desc.includes('gas') || desc.includes('water') || desc.includes('utility')) return 'UTILITIES'
  if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('plumber') || desc.includes('contractor')) return 'MAINTENANCE'
  if (desc.includes('salary') || desc.includes('wage') || desc.includes('payroll')) return 'PAYROLL'
  if (desc.includes('supply') || desc.includes('supplies') || desc.includes('stock')) return 'SUPPLIES'
  if (desc.includes('insurance')) return 'INSURANCE'
  if (desc.includes('tax') || desc.includes('hmrc') || desc.includes('vat')) return 'TAXES'

  return 'OTHER_EXPENSE'
}

