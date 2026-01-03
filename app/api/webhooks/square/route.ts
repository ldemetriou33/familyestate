/**
 * Square Webhook Handler
 * Listens for: payment.updated, order.created
 * Updates: CafeTransaction table
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSquareSignature } from '@/lib/webhooks'
import { WebhookProvider, WebhookStatus, DataSource } from '@prisma/client'

// Square webhook signature key (set in environment)
const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || ''
const SQUARE_WEBHOOK_URL = process.env.SQUARE_WEBHOOK_URL || '' // Your endpoint URL

// Map Square location IDs to property IDs
const locationToPropertyMap: Record<string, string> = {
  // Add your mappings here, e.g.:
  // 'LXXXXXXXXXXXXXX': 'cafe-property-id',
}

interface SquareWebhookPayload {
  merchant_id: string
  type: string
  event_id: string
  created_at: string
  data: {
    type: string
    id: string
    object: {
      payment?: SquarePayment
      order?: SquareOrder
    }
  }
}

interface SquarePayment {
  id: string
  created_at: string
  updated_at: string
  amount_money: { amount: number; currency: string }
  tip_money?: { amount: number; currency: string }
  total_money: { amount: number; currency: string }
  status: string
  source_type: string
  card_details?: {
    card: {
      card_brand: string
      last_4: string
    }
  }
  location_id: string
  order_id?: string
  employee_id?: string
  receipt_number?: string
}

interface SquareOrder {
  id: string
  location_id: string
  created_at: string
  updated_at: string
  state: string
  total_money: { amount: number; currency: string }
  total_discount_money?: { amount: number; currency: string }
  total_tip_money?: { amount: number; currency: string }
  total_tax_money?: { amount: number; currency: string }
  line_items?: Array<{
    uid: string
    name: string
    quantity: string
    total_money: { amount: number; currency: string }
    variation_name?: string
  }>
  tenders?: Array<{
    type: string
    amount_money: { amount: number; currency: string }
    tip_money?: { amount: number; currency: string }
    card_details?: {
      card: { card_brand: string }
    }
  }>
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let logId: string | null = null
  
  try {
    // Get raw body for signature validation
    const rawBody = await request.text()
    const signature = request.headers.get('x-square-hmacsha256-signature')
    const userAgent = request.headers.get('user-agent')
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    
    // Parse the payload
    let payload: SquareWebhookPayload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    
    // Log the incoming webhook
    const log = await prisma.integrationLog.create({
      data: {
        provider: WebhookProvider.SQUARE,
        eventType: payload.type || 'unknown',
        payload: payload as object,
        headers: Object.fromEntries(request.headers.entries()),
        signature: signature || undefined,
        status: WebhookStatus.RECEIVED,
        ipAddress: ip || undefined,
        userAgent: userAgent || undefined,
      },
    })
    logId = log.id
    
    // Validate signature (skip in development if no key set)
    if (SQUARE_WEBHOOK_SIGNATURE_KEY && SQUARE_WEBHOOK_URL) {
      const isValid = validateSquareSignature(
        rawBody, 
        signature, 
        SQUARE_WEBHOOK_SIGNATURE_KEY,
        SQUARE_WEBHOOK_URL
      )
      if (!isValid) {
        await prisma.integrationLog.update({
          where: { id: logId },
          data: {
            status: WebhookStatus.FAILED,
            errorMessage: 'Invalid signature',
          },
        })
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    
    // Process based on event type
    const eventType = payload.type?.toLowerCase()
    let linkedRecordId: string | null = null
    
    switch (eventType) {
      case 'payment.created':
      case 'payment.updated':
        if (payload.data?.object?.payment) {
          linkedRecordId = await handlePayment(payload.data.object.payment)
        }
        break
        
      case 'order.created':
      case 'order.updated':
        if (payload.data?.object?.order) {
          linkedRecordId = await handleOrder(payload.data.object.order)
        }
        break
        
      default:
        await prisma.integrationLog.update({
          where: { id: logId },
          data: {
            status: WebhookStatus.IGNORED,
            errorMessage: `Unknown event type: ${eventType}`,
          },
        })
        return NextResponse.json({ status: 'ignored', reason: 'unknown event type' })
    }
    
    // Update log with success
    await prisma.integrationLog.update({
      where: { id: logId },
      data: {
        status: WebhookStatus.PROCESSED,
        processedAt: new Date(),
        linkedRecordType: 'CafeTransaction',
        linkedRecordId: linkedRecordId || undefined,
      },
    })
    
    const processingTime = Date.now() - startTime
    return NextResponse.json({
      status: 'processed',
      event: eventType,
      processingTimeMs: processingTime,
    })
    
  } catch (error) {
    console.error('Square webhook error:', error)
    
    // Update log with error
    if (logId) {
      await prisma.integrationLog.update({
        where: { id: logId },
        data: {
          status: WebhookStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// HANDLER FUNCTIONS
// ============================================

async function handlePayment(payment: SquarePayment): Promise<string | null> {
  // Find or default property for this location
  const propertyId = locationToPropertyMap[payment.location_id] || await getDefaultCafePropertyId()
  
  if (!propertyId) {
    console.warn('No property found for Square location:', payment.location_id)
    return null
  }
  
  // Extract money values (Square amounts are in smallest currency unit, e.g., pence)
  const grossAmount = payment.total_money?.amount || 0
  const tipAmount = payment.tip_money?.amount || 0
  const netAmount = grossAmount - tipAmount
  
  const transaction = await prisma.cafeTransaction.upsert({
    where: {
      squareOrderId: payment.order_id || payment.id,
    },
    create: {
      propertyId,
      squareOrderId: payment.order_id || payment.id,
      squarePaymentId: payment.id,
      squareLocationId: payment.location_id,
      timestamp: new Date(payment.created_at),
      grossAmount,
      tipAmount,
      netAmount,
      paymentMethod: payment.source_type?.toUpperCase() || 'CARD',
      cardBrand: payment.card_details?.card?.card_brand,
      employeeId: payment.employee_id,
    },
    update: {
      squarePaymentId: payment.id,
      grossAmount,
      tipAmount,
      netAmount,
      paymentMethod: payment.source_type?.toUpperCase() || 'CARD',
      cardBrand: payment.card_details?.card?.card_brand,
    },
  })
  
  // Update daily cafe sales aggregate
  await updateCafeDailySales(propertyId, new Date(payment.created_at))
  
  return transaction.id
}

async function handleOrder(order: SquareOrder): Promise<string | null> {
  // Only process completed orders
  if (order.state !== 'COMPLETED') {
    return null
  }
  
  const propertyId = locationToPropertyMap[order.location_id] || await getDefaultCafePropertyId()
  
  if (!propertyId) {
    console.warn('No property found for Square location:', order.location_id)
    return null
  }
  
  // Extract money values
  const grossAmount = order.total_money?.amount || 0
  const discountAmount = order.total_discount_money?.amount || 0
  const tipAmount = order.total_tip_money?.amount || 0
  const taxAmount = order.total_tax_money?.amount || 0
  const netAmount = grossAmount - tipAmount
  
  // Get payment method from tenders
  const tender = order.tenders?.[0]
  const paymentMethod = tender?.type || 'UNKNOWN'
  const cardBrand = tender?.card_details?.card?.card_brand
  
  // Prepare order items
  const orderItems = order.line_items?.map(item => ({
    name: item.name,
    quantity: parseInt(item.quantity) || 1,
    totalPence: item.total_money?.amount || 0,
    variation: item.variation_name,
  }))
  
  const transaction = await prisma.cafeTransaction.upsert({
    where: {
      squareOrderId: order.id,
    },
    create: {
      propertyId,
      squareOrderId: order.id,
      squareLocationId: order.location_id,
      timestamp: new Date(order.created_at),
      grossAmount,
      discountAmount,
      tipAmount,
      taxAmount,
      netAmount,
      itemCount: order.line_items?.length || 0,
      orderItems: orderItems || [],
      paymentMethod,
      cardBrand,
    },
    update: {
      grossAmount,
      discountAmount,
      tipAmount,
      taxAmount,
      netAmount,
      itemCount: order.line_items?.length || 0,
      orderItems: orderItems || [],
      paymentMethod,
      cardBrand,
    },
  })
  
  // Update daily cafe sales aggregate
  await updateCafeDailySales(propertyId, new Date(order.created_at))
  
  return transaction.id
}

async function getDefaultCafePropertyId(): Promise<string | null> {
  const cafeProperty = await prisma.property.findFirst({
    where: { type: 'CAFE' },
  })
  return cafeProperty?.id || null
}

async function updateCafeDailySales(propertyId: string, date: Date): Promise<void> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  // Aggregate all transactions for the day
  const transactions = await prisma.cafeTransaction.findMany({
    where: {
      propertyId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
      isRefunded: false,
    },
  })
  
  const totalGross = transactions.reduce((sum, t) => sum + t.grossAmount, 0)
  const totalNet = transactions.reduce((sum, t) => sum + t.netAmount, 0)
  const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0)
  const totalCovers = transactions.length
  
  // Convert from pence to pounds
  const grossSales = totalGross / 100
  const netSales = totalNet / 100
  const vat = totalTax / 100
  const avgSpend = totalCovers > 0 ? grossSales / totalCovers : 0
  
  await prisma.cafeSales.upsert({
    where: {
      propertyId_date: {
        propertyId,
        date: startOfDay,
      },
    },
    create: {
      propertyId,
      date: startOfDay,
      grossSales,
      netSales,
      vat,
      covers: totalCovers,
      avgSpend,
      dataSource: DataSource.POS_SQUARE,
      lastUpdatedAt: new Date(),
    },
    update: {
      grossSales,
      netSales,
      vat,
      covers: totalCovers,
      avgSpend,
      dataSource: DataSource.POS_SQUARE,
      lastUpdatedAt: new Date(),
    },
  })
}

// Health check for the webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'square-webhook',
    timestamp: new Date().toISOString(),
    instructions: {
      setup: [
        '1. Go to Square Developer Dashboard',
        '2. Create a Webhook subscription',
        '3. Point it to: https://your-domain.com/api/webhooks/square',
        '4. Select events: payment.created, payment.updated, order.created',
        '5. Copy the Signature Key and set SQUARE_WEBHOOK_SIGNATURE_KEY env var',
      ],
    },
  })
}

