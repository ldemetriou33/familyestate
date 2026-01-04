'use server'

import { prisma } from '@/lib/prisma'

export interface ApprovalItem {
  id: string
  type: 'EXPENSE' | 'REFUND' | 'RATE_CHANGE'
  title: string
  description: string | null
  amount: number | null
  requestedBy: string
  requestedAt: Date
  status: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  propertyName: string | null
}

export interface RateProposal {
  id: string
  propertyName: string
  currentRate: number
  proposedRate: number
  changePercent: number
  reasoning: string
  aiGenerated: boolean
  effectiveFrom: Date
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED'
  createdBy: string
  createdAt: Date
}

/**
 * Get pending approvals from ActionItems
 */
export async function getPendingApprovals(): Promise<ApprovalItem[]> {
  const actionItems = await prisma.actionItem.findMany({
    where: {
      workflowStatus: { in: ['DRAFT', 'PENDING_APPROVAL'] },
      actionType: { in: ['VENDOR_PAYMENT', 'TENANT_COMMUNICATION'] },
    },
    include: {
      approvals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
    take: 20,
  })

  const approvals: ApprovalItem[] = []
  
  for (const item of actionItems) {
    // Get property name if available
    let propertyName: string | null = null
    if (item.relatedPropertyId) {
      const property = await prisma.property.findUnique({
        where: { id: item.relatedPropertyId },
        select: { name: true },
      })
      propertyName = property?.name || null
    }

    // Determine type from actionType
    let type: 'EXPENSE' | 'REFUND' | 'RATE_CHANGE' = 'EXPENSE'
    if (item.actionType === 'VENDOR_PAYMENT') type = 'EXPENSE'
    else if (item.actionType === 'TENANT_COMMUNICATION') type = 'REFUND' // Could be refund or other
    else if (item.actionType === 'RATE_CHANGE') type = 'RATE_CHANGE'

    approvals.push({
      id: item.id,
      type,
      title: item.title,
      description: item.description,
      amount: item.estimatedImpactGbp,
      requestedBy: item.assignedTo || 'System',
      requestedAt: item.createdAt,
      status: item.workflowStatus,
      priority: item.priority === 'CRITICAL' ? 'HIGH' : item.priority === 'HIGH' ? 'HIGH' : item.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW',
      propertyName,
    })
  }

  return approvals
}

/**
 * Get pending rate proposals
 */
export async function getPendingRateProposals(): Promise<RateProposal[]> {
  const proposals = await prisma.rateProposal.findMany({
    where: {
      status: { in: ['DRAFT', 'PENDING_APPROVAL'] },
    },
    include: {
      property: {
        select: { name: true },
      },
      creator: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return proposals.map((p: any) => ({
    id: p.id,
    propertyName: p.property.name,
    currentRate: p.currentRate,
    proposedRate: p.proposedRate,
    changePercent: p.changePercent,
    reasoning: p.reasoning,
    aiGenerated: p.aiGenerated,
    effectiveFrom: p.effectiveFrom,
    status: p.status as 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED',
    createdBy: p.creator.firstName && p.creator.lastName 
      ? `${p.creator.firstName} ${p.creator.lastName}`
      : p.creator.email || 'Unknown',
    createdAt: p.createdAt,
  }))
}

