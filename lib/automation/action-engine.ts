// Abbey OS - Action Automation Engine
// Automatically creates and manages tasks from AI recommendations

import { ActionItem, Priority, ActionStatus } from '../types/abbey-os'
import { AIRecommendation } from '../ai/recommendations'
import { Anomaly } from '../ai/anomaly-detection'
import { PredictiveAlert } from '../ai/predictive-alerts'

export interface AutomatedAction extends ActionItem {
  source: 'AI_RECOMMENDATION' | 'ANOMALY' | 'PREDICTIVE_ALERT' | 'SCHEDULED' | 'MANUAL'
  sourceId: string
  automationRule?: string
  notificationsSent: boolean
  escalationLevel: number
}

export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationActionConfig[]
  isActive: boolean
}

export type AutomationTrigger = 
  | 'CRITICAL_ALERT'
  | 'OCCUPANCY_DROP'
  | 'ARREARS_THRESHOLD'
  | 'MARGIN_BELOW_TARGET'
  | 'COMPLIANCE_EXPIRY'
  | 'CASH_RUNWAY_LOW'
  | 'AI_RECOMMENDATION'

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
  value: string | number
}

export interface AutomationActionConfig {
  type: 'CREATE_TASK' | 'SEND_NOTIFICATION' | 'ESCALATE' | 'WEBHOOK'
  config: Record<string, any>
}

// Default automation rules
export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-critical-alert',
    name: 'Critical Alert Response',
    trigger: 'CRITICAL_ALERT',
    conditions: [],
    actions: [
      { type: 'CREATE_TASK', config: { priority: 'HIGH', assignTo: 'owner' } },
      { type: 'SEND_NOTIFICATION', config: { channels: ['email', 'sms'] } },
    ],
    isActive: true,
  },
  {
    id: 'rule-arrears',
    name: 'Arrears Escalation',
    trigger: 'ARREARS_THRESHOLD',
    conditions: [{ field: 'arrearsRatio', operator: 'greater_than', value: 10 }],
    actions: [
      { type: 'CREATE_TASK', config: { priority: 'HIGH', category: 'Finance' } },
      { type: 'SEND_NOTIFICATION', config: { channels: ['email'] } },
    ],
    isActive: true,
  },
  {
    id: 'rule-occupancy',
    name: 'Low Occupancy Campaign',
    trigger: 'OCCUPANCY_DROP',
    conditions: [{ field: 'occupancy', operator: 'less_than', value: 60 }],
    actions: [
      { type: 'CREATE_TASK', config: { priority: 'MEDIUM', category: 'Marketing' } },
    ],
    isActive: true,
  },
  {
    id: 'rule-compliance',
    name: 'Compliance Certificate Expiry',
    trigger: 'COMPLIANCE_EXPIRY',
    conditions: [{ field: 'daysUntilExpiry', operator: 'less_than', value: 30 }],
    actions: [
      { type: 'CREATE_TASK', config: { priority: 'HIGH', category: 'Compliance' } },
      { type: 'SEND_NOTIFICATION', config: { channels: ['email'] } },
    ],
    isActive: true,
  },
  {
    id: 'rule-margin',
    name: 'Margin Alert',
    trigger: 'MARGIN_BELOW_TARGET',
    conditions: [{ field: 'cafeMargin', operator: 'less_than', value: 60 }],
    actions: [
      { type: 'CREATE_TASK', config: { priority: 'MEDIUM', category: 'Operations' } },
    ],
    isActive: true,
  },
]

/**
 * Convert AI recommendation to automated action
 */
export function recommendationToAction(rec: AIRecommendation): AutomatedAction {
  const dueDate = rec.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  return {
    id: `auto-${rec.id}`,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    status: 'PENDING',
    estimatedImpactGbp: rec.estimatedImpact,
    urgencyScore: rec.priority === 'HIGH' ? 9 : rec.priority === 'MEDIUM' ? 6 : 3,
    dueDate,
    category: rec.category,
    source: 'AI_RECOMMENDATION',
    sourceId: rec.id,
    notificationsSent: false,
    escalationLevel: 0,
  }
}

/**
 * Convert anomaly to automated action
 */
export function anomalyToAction(anomaly: Anomaly): AutomatedAction {
  return {
    id: `auto-anomaly-${anomaly.id}`,
    title: `Investigate: ${anomaly.message}`,
    description: anomaly.recommendation,
    priority: anomaly.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    status: 'PENDING',
    estimatedImpactGbp: Math.abs(anomaly.deviation) * anomaly.expectedValue * 0.01,
    urgencyScore: anomaly.severity === 'CRITICAL' ? 9 : 6,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    category: anomaly.category,
    source: 'ANOMALY',
    sourceId: anomaly.id,
    notificationsSent: false,
    escalationLevel: 0,
  }
}

/**
 * Convert predictive alert to automated action
 */
export function predictiveAlertToAction(alert: PredictiveAlert): AutomatedAction {
  return {
    id: `auto-pred-${alert.id}`,
    title: `🔮 ${alert.title}`,
    description: `${alert.message}\n\nRecommendation: ${alert.recommendation}`,
    priority: alert.severity === 'CRITICAL' ? 'HIGH' : alert.severity === 'WARNING' ? 'MEDIUM' : 'LOW',
    status: 'PENDING',
    estimatedImpactGbp: alert.estimatedImpact,
    urgencyScore: Math.max(1, 10 - alert.daysUntil),
    dueDate: new Date(Date.now() + Math.max(1, alert.daysUntil - 3) * 24 * 60 * 60 * 1000),
    category: alert.category,
    source: 'PREDICTIVE_ALERT',
    sourceId: alert.id,
    notificationsSent: false,
    escalationLevel: 0,
  }
}

/**
 * Process all AI insights and generate automated actions
 */
export function processAIInsights(
  recommendations: AIRecommendation[],
  anomalies: Anomaly[],
  predictiveAlerts: PredictiveAlert[],
  existingActionIds: Set<string> = new Set()
): AutomatedAction[] {
  const actions: AutomatedAction[] = []

  // Process recommendations (top 5 by impact)
  recommendations
    .slice(0, 5)
    .forEach(rec => {
      const actionId = `auto-${rec.id}`
      if (!existingActionIds.has(actionId)) {
        actions.push(recommendationToAction(rec))
      }
    })

  // Process critical anomalies
  anomalies
    .filter(a => a.severity === 'CRITICAL')
    .forEach(anomaly => {
      const actionId = `auto-anomaly-${anomaly.id}`
      if (!existingActionIds.has(actionId)) {
        actions.push(anomalyToAction(anomaly))
      }
    })

  // Process predictive alerts (urgent ones only - within 7 days)
  predictiveAlerts
    .filter(a => a.daysUntil <= 7)
    .forEach(alert => {
      const actionId = `auto-pred-${alert.id}`
      if (!existingActionIds.has(actionId)) {
        actions.push(predictiveAlertToAction(alert))
      }
    })

  // Sort by urgency and impact
  return actions.sort((a, b) => {
    const urgencyDiff = (b.urgencyScore || 0) - (a.urgencyScore || 0)
    if (urgencyDiff !== 0) return urgencyDiff
    return (b.estimatedImpactGbp || 0) - (a.estimatedImpactGbp || 0)
  })
}

/**
 * Quick actions for common tasks
 */
export interface QuickAction {
  id: string
  label: string
  icon: string
  action: () => void | Promise<void>
  category: string
  estimatedTime: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-arrears-letter',
    label: 'Send Arrears Letter',
    icon: 'Mail',
    action: async () => { console.log('Sending arrears letter...') },
    category: 'Finance',
    estimatedTime: '5 min',
  },
  {
    id: 'qa-book-contractor',
    label: 'Book Contractor',
    icon: 'Wrench',
    action: async () => { console.log('Opening contractor booking...') },
    category: 'Maintenance',
    estimatedTime: '10 min',
  },
  {
    id: 'qa-update-rates',
    label: 'Update Hotel Rates',
    icon: 'PoundSterling',
    action: async () => { console.log('Opening rate management...') },
    category: 'Revenue',
    estimatedTime: '15 min',
  },
  {
    id: 'qa-run-promotion',
    label: 'Launch Promotion',
    icon: 'Megaphone',
    action: async () => { console.log('Opening promotion wizard...') },
    category: 'Marketing',
    estimatedTime: '20 min',
  },
  {
    id: 'qa-tenant-contact',
    label: 'Contact Tenant',
    icon: 'Phone',
    action: async () => { console.log('Opening tenant contact...') },
    category: 'Lettings',
    estimatedTime: '10 min',
  },
  {
    id: 'qa-compliance-check',
    label: 'Book Safety Inspection',
    icon: 'ClipboardCheck',
    action: async () => { console.log('Opening compliance booking...') },
    category: 'Compliance',
    estimatedTime: '15 min',
  },
]

