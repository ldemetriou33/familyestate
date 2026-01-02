/**
 * ABBEY OS - Multi-Agent Architecture
 * Email & Message Templates
 */

// ============================================
// ARREARS CHASE TEMPLATES
// ============================================

export interface ArrearsTenantData {
  tenantName: string
  unitNumber: string
  arrearsAmount: number
  arrearsDays: number
  lastPaymentDate?: string
  propertyAddress?: string
}

export const chase_mild = (data: ArrearsTenantData): { subject: string; body: string } => ({
  subject: `Friendly Reminder: Rent Payment for ${data.unitNumber}`,
  body: `Dear ${data.tenantName},

I hope this email finds you well.

I wanted to send a quick reminder that your rent payment of £${data.arrearsAmount.toLocaleString()} for ${data.unitNumber} is now ${data.arrearsDays} days overdue.

We understand that sometimes payments can be delayed. If you've already made this payment, please disregard this message and accept our apologies for the overlap.

If you're experiencing any difficulties, please don't hesitate to get in touch. We're always happy to discuss payment arrangements if needed.

You can make your payment via bank transfer to our usual account details, or contact us to discuss alternative arrangements.

Thank you for your prompt attention to this matter.

Kind regards,
Abbey Estate Management`
})

export const chase_firm = (data: ArrearsTenantData): { subject: string; body: string } => ({
  subject: `URGENT: Overdue Rent Payment - ${data.unitNumber}`,
  body: `Dear ${data.tenantName},

This is a formal notice regarding outstanding rent for ${data.unitNumber}.

Your account shows an overdue balance of £${data.arrearsAmount.toLocaleString()}, which is now ${data.arrearsDays} days past due.

To avoid further action, please ensure payment is received within 7 days of this notice.

If you have already made this payment, please forward confirmation to us immediately.

If you are experiencing financial difficulties, you must contact us within 48 hours to discuss a payment plan. Failure to respond may result in further action being taken.

Outstanding Balance: £${data.arrearsAmount.toLocaleString()}
Days Overdue: ${data.arrearsDays}
Property: ${data.unitNumber}

Please treat this matter as urgent.

Abbey Estate Management`
})

export const chase_final = (data: ArrearsTenantData): { subject: string; body: string } => ({
  subject: `FINAL NOTICE: Rent Arrears - Immediate Action Required`,
  body: `Dear ${data.tenantName},

FINAL NOTICE BEFORE LEGAL ACTION

Despite previous communications, your rent account for ${data.unitNumber} remains in arrears.

Outstanding Balance: £${data.arrearsAmount.toLocaleString()}
Days Overdue: ${data.arrearsDays}

This is your final notice. If payment is not received in full within 7 days, we will have no option but to commence legal proceedings, which may include:
- Serving a Section 8 notice
- County Court proceedings
- Potential eviction action

This will also be reported to credit reference agencies and may affect your future ability to rent property.

If you wish to avoid these steps, you must either:
1. Pay the full outstanding balance immediately, OR
2. Contact us TODAY to agree a formal repayment plan

Time is of the essence. Please treat this as a matter of extreme urgency.

Abbey Estate Management
Legal Department`
})

// ============================================
// MAINTENANCE TEMPLATES
// ============================================

export interface MaintenanceTicketData {
  ticketId: string
  title: string
  description: string
  location: string
  reportedBy: string
  reportedAt: string
  severity: string
}

export const contractor_urgent_sms = (data: MaintenanceTicketData): string =>
  `URGENT: ${data.title} at ${data.location}. ${data.severity.toUpperCase()} priority. Please respond ASAP. Ticket: ${data.ticketId}`

export const contractor_routine_email = (data: MaintenanceTicketData): { subject: string; body: string } => ({
  subject: `Maintenance Request: ${data.title} - ${data.ticketId}`,
  body: `New maintenance request for your attention:

Ticket ID: ${data.ticketId}
Location: ${data.location}
Priority: ${data.severity}
Reported: ${data.reportedAt}

Description:
${data.description}

Reported by: ${data.reportedBy}

Please schedule this work at your earliest convenience and update the ticket with your availability.

Abbey Estate Management`
})

// ============================================
// PRICING TEMPLATES
// ============================================

export interface PricingProposalData {
  discountPercent: number
  startDate: string
  endDate: string
  currentOccupancy: number
  targetOccupancy: number
  estimatedRevenueLoss: number
  estimatedAdditionalBookings: number
}

export const pricing_proposal_summary = (data: PricingProposalData): string =>
  `Low occupancy detected (${data.currentOccupancy}% vs target ${data.targetOccupancy}%). ` +
  `Recommending ${data.discountPercent}% discount from ${data.startDate} to ${data.endDate}. ` +
  `Est. revenue impact: -£${data.estimatedRevenueLoss.toLocaleString()}, but could attract ${data.estimatedAdditionalBookings} additional bookings.`

// ============================================
// WEEKLY DIGEST TEMPLATES
// ============================================

export interface WeeklyDigestData {
  weekStarting: string
  maintenanceItems: MaintenanceTicketData[]
  arrearsCount: number
  totalArrearsAmount: number
  occupancyAverage: number
  revenueTotal: number
}

export const weekly_digest = (data: WeeklyDigestData): { subject: string; body: string } => ({
  subject: `Abbey Estate Weekly Digest - Week of ${data.weekStarting}`,
  body: `
ABBEY ESTATE - WEEKLY DIGEST
Week commencing: ${data.weekStarting}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 KEY METRICS
• Occupancy Average: ${data.occupancyAverage}%
• Revenue Total: £${data.revenueTotal.toLocaleString()}
• Arrears Cases: ${data.arrearsCount} (£${data.totalArrearsAmount.toLocaleString()} outstanding)

🔧 MAINTENANCE (Non-Urgent)
${data.maintenanceItems.length > 0 
  ? data.maintenanceItems.map(item => `• ${item.location}: ${item.title}`).join('\n')
  : '• No non-urgent maintenance items this week'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This digest was generated automatically by Abbey OS.
Review full details in the Command Center.
`
})

