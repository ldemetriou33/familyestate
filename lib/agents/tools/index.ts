/**
 * ABBEY OS - Multi-Agent Architecture
 * Shared Tools Registry
 * 
 * Tools are the actions that agents can take.
 * Each tool has a name, description, parameters, and execute function.
 */

import { AgentTool, ToolResult } from '../types'

// ============================================
// COMMUNICATION TOOLS
// ============================================

export const sendSMS: AgentTool = {
  name: 'sendSMS',
  description: 'Send an SMS message via Twilio to a phone number',
  parameters: {
    to: { type: 'string', description: 'Phone number in E.164 format', required: true },
    message: { type: 'string', description: 'SMS message content (max 160 chars)', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const { to, message } = params as { to: string; message: string }
    
    // In production, this would call Twilio API
    console.log(`[Tool: sendSMS] To: ${to}, Message: ${message}`)
    
    // Mock implementation
    if (!process.env.TWILIO_ACCOUNT_SID) {
      return {
        success: true,
        data: { messageId: `mock-${Date.now()}`, status: 'queued' },
        metadata: { mock: true },
      }
    }

    try {
      // Real Twilio implementation would go here
      // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      // const result = await twilio.messages.create({ to, body: message, from: process.env.TWILIO_PHONE_NUMBER })
      
      return {
        success: true,
        data: { messageId: `mock-${Date.now()}`, status: 'sent' },
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },
}

export const sendEmail: AgentTool = {
  name: 'sendEmail',
  description: 'Queue an email to be sent (or send immediately if auto_send is true)',
  parameters: {
    to: { type: 'string', description: 'Recipient email address', required: true },
    subject: { type: 'string', description: 'Email subject line', required: true },
    body: { type: 'string', description: 'Email body (HTML supported)', required: true },
    template: { type: 'string', description: 'Template name to use', required: false },
    auto_send: { type: 'boolean', description: 'Send immediately vs queue for review', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { to, subject, body, auto_send } = params as { 
      to: string; subject: string; body: string; auto_send?: boolean 
    }
    
    console.log(`[Tool: sendEmail] To: ${to}, Subject: ${subject}, Auto-send: ${auto_send}`)
    
    // In production, this would use a service like Resend, SendGrid, etc.
    return {
      success: true,
      data: { 
        emailId: `email-${Date.now()}`,
        status: auto_send ? 'sent' : 'queued_for_review',
        to,
        subject,
      },
    }
  },
}

// ============================================
// DATABASE TOOLS
// ============================================

export const checkRentRoll: AgentTool = {
  name: 'checkRentRoll',
  description: 'Check the rent roll for overdue payments and arrears',
  parameters: {
    daysOverdue: { type: 'number', description: 'Minimum days overdue to include', required: false },
    propertyId: { type: 'string', description: 'Filter by property ID', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { daysOverdue = 1, propertyId } = params as { daysOverdue?: number; propertyId?: string }
    
    console.log(`[Tool: checkRentRoll] Days overdue >= ${daysOverdue}, Property: ${propertyId || 'all'}`)
    
    // In production, this would query the database
    // const arrears = await prisma.rentRoll.findMany({
    //   where: { arrearsDays: { gte: daysOverdue }, isActive: true }
    // })
    
    // Mock data
    const mockArrears = [
      { tenantName: 'John Smith', unitNumber: 'Flat 2B', arrearsDays: 5, arrearsAmount: 950, email: 'john@example.com' },
      { tenantName: 'Sarah Connor', unitNumber: 'Flat 4A', arrearsDays: 12, arrearsAmount: 1900, email: 'sarah@example.com' },
    ].filter(a => a.arrearsDays >= daysOverdue)
    
    return {
      success: true,
      data: {
        count: mockArrears.length,
        totalArrears: mockArrears.reduce((sum, a) => sum + a.arrearsAmount, 0),
        tenants: mockArrears,
      },
    }
  },
}

export const checkOccupancy: AgentTool = {
  name: 'checkOccupancy',
  description: 'Check hotel occupancy for a date range',
  parameters: {
    startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    endDate: { type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    propertyId: { type: 'string', description: 'Hotel property ID', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { startDate, endDate, propertyId } = params as { 
      startDate: string; endDate: string; propertyId?: string 
    }
    
    console.log(`[Tool: checkOccupancy] ${startDate} to ${endDate}, Property: ${propertyId || 'all'}`)
    
    // Mock data - in production, query HotelMetric table
    const mockOccupancy = {
      averageOccupancy: 42,
      dates: [
        { date: '2026-01-04', occupancy: 38, roomsAvailable: 12, roomsBooked: 4 },
        { date: '2026-01-05', occupancy: 45, roomsAvailable: 12, roomsBooked: 5 },
        { date: '2026-01-06', occupancy: 42, roomsAvailable: 12, roomsBooked: 5 },
      ],
      isLowOccupancy: true,
    }
    
    return {
      success: true,
      data: mockOccupancy,
    }
  },
}

export const getMaintenanceTickets: AgentTool = {
  name: 'getMaintenanceTickets',
  description: 'Get new or open maintenance tickets',
  parameters: {
    status: { type: 'string', description: 'Filter by status: new, open, in_progress, closed', required: false },
    severity: { type: 'string', description: 'Filter by severity: critical, high, medium, low', required: false },
    limit: { type: 'number', description: 'Maximum number of tickets to return', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { status = 'new', severity, limit = 10 } = params as { 
      status?: string; severity?: string; limit?: number 
    }
    
    console.log(`[Tool: getMaintenanceTickets] Status: ${status}, Severity: ${severity || 'all'}`)
    
    // Mock data
    const mockTickets = [
      { 
        id: 'maint-001', 
        title: 'Boiler not heating properly', 
        description: 'Guest in Room 101 reports no hot water since this morning',
        location: 'Room 101',
        reportedBy: 'Guest',
        reportedAt: new Date().toISOString(),
        status: 'new',
        severity: null, // Not yet classified
      },
      { 
        id: 'maint-002', 
        title: 'Window won\'t close', 
        description: 'Latch broken on bedroom window',
        location: 'Flat 3C',
        reportedBy: 'Tenant',
        reportedAt: new Date().toISOString(),
        status: 'new',
        severity: null,
      },
    ]
    
    return {
      success: true,
      data: {
        count: mockTickets.length,
        tickets: mockTickets.slice(0, limit),
      },
    }
  },
}

// ============================================
// CLASSIFICATION TOOLS
// ============================================

export const classifySeverity: AgentTool = {
  name: 'classifySeverity',
  description: 'Classify the severity of a maintenance ticket using AI',
  parameters: {
    ticketId: { type: 'string', description: 'The maintenance ticket ID', required: true },
    title: { type: 'string', description: 'Ticket title', required: true },
    description: { type: 'string', description: 'Ticket description', required: true },
    location: { type: 'string', description: 'Where the issue is located', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const { ticketId, title, description, location } = params as { 
      ticketId: string; title: string; description: string; location: string 
    }
    
    console.log(`[Tool: classifySeverity] Classifying ticket ${ticketId}: ${title}`)
    
    // In production, this would use GPT-4 to classify
    // For now, use simple keyword matching
    const urgentKeywords = ['flood', 'fire', 'leak', 'boiler', 'heating', 'no hot water', 'broken pipe', 'gas smell', 'electrical', 'security']
    const isUrgent = urgentKeywords.some(kw => 
      title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw)
    )
    
    const severity = isUrgent ? 'high' : 'low'
    const reason = isUrgent 
      ? 'Contains urgent keywords indicating potential safety or habitability issue'
      : 'Appears to be a non-urgent maintenance request'
    
    return {
      success: true,
      data: {
        ticketId,
        severity,
        reason,
        confidence: 0.85,
        suggestedResponse: severity === 'high' 
          ? 'Contact contractor immediately' 
          : 'Add to weekly maintenance digest',
      },
    }
  },
}

// ============================================
// PRICING TOOLS
// ============================================

export const applyDiscount: AgentTool = {
  name: 'applyDiscount',
  description: 'Propose a discount rate change for hotel rooms',
  parameters: {
    discountPercent: { type: 'number', description: 'Discount percentage (e.g., 10 for 10%)', required: true },
    startDate: { type: 'string', description: 'Start date for discount (YYYY-MM-DD)', required: true },
    endDate: { type: 'string', description: 'End date for discount (YYYY-MM-DD)', required: true },
    roomTypes: { type: 'array', description: 'Array of room types to apply discount to', required: false },
    reason: { type: 'string', description: 'Reason for the discount', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const { discountPercent, startDate, endDate, roomTypes, reason } = params as { 
      discountPercent: number; startDate: string; endDate: string; roomTypes?: string[]; reason: string 
    }
    
    console.log(`[Tool: applyDiscount] ${discountPercent}% from ${startDate} to ${endDate}`)
    
    // In production, this would create a RateProposal record
    return {
      success: true,
      data: {
        proposalId: `proposal-${Date.now()}`,
        discountPercent,
        startDate,
        endDate,
        roomTypes: roomTypes || ['all'],
        reason,
        status: 'pending_approval',
        estimatedRevenueImpact: discountPercent * -100, // Simplified calculation
      },
    }
  },
}

// ============================================
// ACTION QUEUE TOOLS
// ============================================

export const queueActionItem: AgentTool = {
  name: 'queueActionItem',
  description: 'Add an action item to the Command Center queue for human review',
  parameters: {
    title: { type: 'string', description: 'Action item title', required: true },
    description: { type: 'string', description: 'Detailed description', required: true },
    priority: { type: 'string', description: 'Priority: critical, high, medium, low', required: true },
    category: { type: 'string', description: 'Category: maintenance, finance, compliance, operations', required: true },
    dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)', required: false },
    suggestedAction: { type: 'string', description: 'What the agent recommends', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const { title, description, priority, category, dueDate, suggestedAction } = params as { 
      title: string; description: string; priority: string; category: string; dueDate?: string; suggestedAction: string 
    }
    
    console.log(`[Tool: queueActionItem] ${priority.toUpperCase()}: ${title}`)
    
    // In production, this would create an ActionItem record
    return {
      success: true,
      data: {
        actionItemId: `action-${Date.now()}`,
        title,
        description,
        priority,
        category,
        dueDate,
        suggestedAction,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    }
  },
}

// ============================================
// TOOL REGISTRY
// ============================================

export const allTools: Record<string, AgentTool> = {
  sendSMS,
  sendEmail,
  checkRentRoll,
  checkOccupancy,
  getMaintenanceTickets,
  classifySeverity,
  applyDiscount,
  queueActionItem,
}

export function getTool(name: string): AgentTool | undefined {
  return allTools[name]
}

